import { Socket as TcpSocket,connect } from "net";
import {Socket as UdpSocket, createSocket} from "dgram";


// #FUNCTION# ====================================================================================================================
// Name...........: 	_NTRInitRemoteplay
// Description ...: 	Connects to a (New) 3DS running NTR CFW and sends the remoteplay() command.
// Syntax.........: 	_NTRInitRemoteplay(sIp ,[$bPriorityMode = 0 [, $iPriorityFactor = 5 [, $iQuality = 90 [, $iQosValue = 20]]]])
// Parameters ....: 	$sIp   				- String containing the IP to the target (New) 3DS system
//					$bPriorityMode 		- (Default: 1) Sets the priority to either the top or bottom screen (1 = Top, 0 = Bottom)
//					$iPriorityFactor 	- (Default: 5) Sets the priority factor of the screen specified in $bPriorityMode
//					$iQuality			- (Default: 90) Sets the JPEG compression quality, range from 1 to 100.
//					$iQosValue			- (Default: 20) Sets the QoS value. If set to over 100, then the QoS feature is disabled.
// Return values .: 	Success     		- 1
//                  	Failure     		- Returns -1
// Author ........: 	RattletraPM
// Modified.......:	10/11/2017
// Remarks .......: 	You MUSTN'T specify the connection port, as NTR always expects a connection on port 8000.
//					It's highly recommended to set TCPTimeout to a value higher than default (Snickerstream uses 5000).
// Related .......: 	_NTRSendNFCPatch, TCPTimeout (Option)
// Link ..........:
// Example .......: 	See Snickerstream's source code
// ===============================================================================================================================
function toPaddedHexString(num:number, len:number) {
    const str = num.toString(16)//
    return "0".repeat(len - str.length) + str;
}
function toByte(num:number) {
    return toPaddedHexString(num, 2);
}
function openConnect(ip:string, port:number):Promise<TcpSocket> {
    return new Promise((resolve, reject) => {
        const socket:TcpSocket = connect(port, ip, () => {
            resolve(socket);
        });
        socket.setTimeout(5000);
        socket.addListener("error", (error:Error) => {
            reject(error);
        })
    });
}

const sleep = (milliseconds:number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
const writeSocket = (socket:TcpSocket, dBinaryPacket:Buffer):Promise<void> => {
    return new Promise((resolve, reject) => {
        socket.write(dBinaryPacket, () => {
            console.log(`write ${dBinaryPacket.toString('hex')}`);
            resolve();
        });
    })
}
async function NTRInitRemoteplay(sIp:string, bPriorityMode = 1, iPriorityFactor = 5, iQuality = 90, iQosValue = 20) {
    if (bPriorityMode > 1 || bPriorityMode < 0 || iPriorityFactor === 0 || iQuality === 0 ||
        iQosValue === 0 || iPriorityFactor > 255 || iQuality > 100) {
        return false;
    }
    //This is the TCP package that needs to be sent to the N3DS. Under other cirumstances we'd want to change other bytes but to
    //initialize remoteplay we only need to care about bytes 0x10, 0x11, 0x14 and 0x1A.
    //
    //Bytes 0x10 and 0x14 contain, respectively, the priority factor and JPEG quality variables. All we need to do is to convert
    //them from DEC to HEX et voilà, they work.
    //
    //Byte 0x11 is the priority mode byte. This is a weird one: internally, 1 is for top screen and 0 is for bottom screen. If
    //you've used NTRClient, howerer, you've probably noticed that the boolean is actually FLIPPED, so 0 is top screen and
    //1 is bottom screen. I don't know why cell9 thought this was a good idea so, as we're sending a RAW package here, I've
    //decided to NOT flip the boolean. This way, there won't be any confusion regarding what this value actually means, and
    //1 will always mean top screen and 0 bottom screen in this UDF and Snickerstream's source code.
    //
    //Finally, byte 0x1A contains the QoS value. I have no idea why, but NTR expects it to be double its intended value.

    const packageStr = `78563412B80B00000000000085030000${toByte(iPriorityFactor)}${toByte(bPriorityMode)}0000${toByte(iQuality)}0000000000${toByte(iQosValue * 2)}${"00".repeat(57)}`;
    const dBinaryPacket = Buffer.from(packageStr, 'hex');
    const sPort = 8000;

    const iSocket = await openConnect( sIp,sPort,);
    console.log(`connected to ${sIp}:${sPort}`);
    await writeSocket(iSocket, dBinaryPacket);
    await sleep(1000);
    iSocket.destroy();
    console.log(`disconnected to ${sIp}:${sPort}`);

    await sleep(3000);								//Give NTR enough time to start remoteplay
    const socket = await openConnect(sIp, sPort);//NTR expects us to reconnect before it starts streaming frames
    console.log(`connected to ${sIp}:${sPort}`);
    socket.destroy();//We'll disconnect right after reconnecting to save bandwidth
    console.log(`disconnected to ${sIp}:${sPort}`);

    return true;
}
interface FrameHeader{
    frameID : number,
    lastOne : boolean, 
    isTop : boolean,
    packetNum: number,
}
interface FrameParts {
    header:FrameHeader,
    content:Buffer,
}
interface Frame {
    frameID: number,
    isTop: boolean,
    jpeg: Buffer,
}
type closeHandle = ()=>void;
type FrameListener = (evt: Frame | Error )=>void;
//#FUNCTION# ====================================================================================================================
//Name...........: 	_NTRRemoteplayReadJPEG
//Description ...: 	Reads a JPEG file sent by NTR.
//Syntax.........: 	_NTRRemoteplayReadJPEG($sIp)
//Parameters ....: 	$iSocket			- 	Variable returned by UDPBind()
//					$iScreen			-	Only return frames shown by this screen
//Return values .: 	Success     		- 	Binary JPEG variable
//                 	Failure     		- 	Returns -1, sets @error to non-zero if an UDP error occurred
//					@error				- 	Windows API WSAStartup return value (see MSDN).
//Author ........: 	RattletraPM
//Modified.......:	10/11/2017
//Remarks .......: 	This function doesn't handle any UDP-related functions (except for UDPRecv, of course) to optimize performace.
//					This means that you have to call UDPStartup(), UDPShutdown() and, obivously, UDPBind() by yourself!
//					When calling UDPBind(), remember that the IP address to bind is probably @IPAddress1 and that NTR always
//					streams its JPEG files on port 8001.
//					The function is meant to be in a loop that constantly checks if the recieved image is valid.
//Related .......: 	_NTRInitRemoteplay, UDPStartup(), UDPShutdown(), UDPBind()
//Link ..........:
//Example .......: 	See Snickerstream's source code
//===============================================================================================================================
function NTRRemoteplayReadJPEG(listener:FrameListener):closeHandle {
    const iSocket:UdpSocket = createSocket('udp4');
    let currentFrameId = -1;
    let frameList: FrameParts[] = [];

    iSocket.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        listener(err);
    });

    iSocket.on('message', (msg, rinfo) => {
        console.log(`server got: ${msg.length} from ${rinfo.address}:${rinfo.port}`);
        const header = _NTRRemoteplayReadPacketHeader(msg);
        //first frame
        if (currentFrameId !== header.frameID) {
            if (frameList.length !== 0) {
                console.warn(`drop frame ${currentFrameId}`);
                frameList = [];
            }
            currentFrameId = header.frameID;
        }
        console.log(`push ${JSON.stringify(header)}`);
        frameList.push({ header, content: msg.subarray(4) });

        if (header.lastOne) {
            //assemble
            frameList.sort((a, b) => a.header.packetNum - b.header.packetNum);
            const packetNums = frameList.map(f => { return f.header.packetNum }).join(",");
            console.log(`assemble ${header.frameID} ${packetNums}`);

            const jpegParts = frameList.map(f => { return f.content });
            const jpeg = Buffer.concat(jpegParts);
            const verify = jpeg.subarray(jpeg.length - 2).toString('hex').toUpperCase();
            if (verify !== "FFD9") {
                console.log(`verify is wrong ${verify}`);
                return;
            }
            // console.log(`${jpegStr}`);
            const oneFrame = {
                frameID: header.frameID,
                isTop: frameList[0].header.isTop,
                jpeg,
            };
            listener(oneFrame);
            frameList = [];
        }

    });

    iSocket.on('listening', () => {
        const address = iSocket.address();
        console.log(`server listening ${address.address}:${address.port}`);
    });

    iSocket.bind(8001);
    return ()=>{
        iSocket.close()
    };
}

//#FUNCTION# ====================================================================================================================
//Name...........: 	_NTRRemoteplayReadPacketHeader
//Description ...: 	Reads the header of a packet sent by NTR.
//Syntax.........: 	_NTRRemoteplayReadJPEG($dPacket)
//Parameters ....: 	$dPacket			- Binary packet whose header needs to be read
//Return values .: 	Success     		- An array containing 3 elements (Frame ID, IsTop, Packet Number)
//                 	Failure     		- Returns 0 and sets @error to non-zero
//					@error				- 1 $dPacket is not a binary type variable
//										- 2 Invalid packet ($dPacket contains less than 4 bytes)
//Author ........: 	RattletraPM
//Modified.......:	10/11/2017
//Remarks .......: 	$dPacket can either be an entire packet or the first four bytes (aka the header) of a packet.
//Related .......: 	_NTRRemoteplayReadJPEG
//Link ..........:
//Example .......: 	See Snickerstream's source code
//===============================================================================================================================
function _NTRRemoteplayReadPacketHeader(dPacket:Buffer):FrameHeader {
    if (dPacket.length < 4) {
        throw new Error(`dPacket length ${dPacket.length} is too short`) //If $dPacket contains less than four bytes, abort (a NTR package needs to have at least 4 bytes)
    }


    //If you look closely at the next piece of code, you'll notice that we read every byte in the header except the 3rd one. In order
    //to understand why, you should consider the following:
    //A remoteplay packet sent by NTR looks like this
    //
    //== HEADER ==
    //0x00: Frame ID
    //0x01: First Nibble:if set to 1, it means that the packet is the last one in a JPEG stream.Second Nibble:Screen, 1=Top/0=Bottom
    //0x02: Image format, usually this is set to 2
    //0x03: Packet number in JPEG stream
    //
    //== BODY ==
    //0x04 to 0x0n: JPEG data
    //
    //Now, it would make sense to send information about the format that's being used to the viewer application, but we really don't
    //care if we use AutoIt - and that's because every format used by NTR should be supported by GDI+ out of the box. So, it's
    //better to just skip that byte instead of reading something that's never going to be used, right? ¯\_(ツ)_/¯
    const frameID = dPacket.readUInt8(0);
    const lastOne = Boolean(dPacket.readInt8(1) >> 1);
    const isTop = Boolean(dPacket.readInt8(1) & 0x1);
    const packetNum = dPacket.readInt8(3);

    console.log(`Packet received: frameID:${frameID},lastOne:${lastOne}, isTop:${isTop},packetNum:${packetNum}`)

    return { frameID, lastOne, isTop, packetNum };
}

