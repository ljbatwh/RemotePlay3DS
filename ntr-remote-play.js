"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = require("net");
var dgram_1 = require("dgram");
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
function toPaddedHexString(num, len) {
    var str = num.toString(16); //
    return "0".repeat(len - str.length) + str;
}
function toByte(num) {
    return toPaddedHexString(num, 2);
}
function openConnect(ip, port) {
    return new Promise(function (resolve, reject) {
        var socket = net_1.connect(port, ip, function () {
            resolve(socket);
        });
        socket.setTimeout(5000);
        socket.addListener("error", function (error) {
            reject(error);
        });
    });
}
var sleep = function (milliseconds) {
    return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); });
};
var writeSocket = function (socket, dBinaryPacket) {
    return new Promise(function (resolve, reject) {
        socket.write(dBinaryPacket, function () {
            console.log("write " + dBinaryPacket.toString('hex'));
            resolve();
        });
    });
};
function NTRInitRemoteplay(sIp, bPriorityMode, iPriorityFactor, iQuality, iQosValue) {
    if (bPriorityMode === void 0) { bPriorityMode = 1; }
    if (iPriorityFactor === void 0) { iPriorityFactor = 5; }
    if (iQuality === void 0) { iQuality = 90; }
    if (iQosValue === void 0) { iQosValue = 20; }
    return __awaiter(this, void 0, void 0, function () {
        var packageStr, dBinaryPacket, sPort, iSocket, socket;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (bPriorityMode > 1 || bPriorityMode < 0 || iPriorityFactor === 0 || iQuality === 0 ||
                        iQosValue === 0 || iPriorityFactor > 255 || iQuality > 100) {
                        return [2 /*return*/, false];
                    }
                    packageStr = "78563412B80B00000000000085030000" + toByte(iPriorityFactor) + toByte(bPriorityMode) + "0000" + toByte(iQuality) + "0000000000" + toByte(iQosValue * 2) + "00".repeat(57);
                    dBinaryPacket = Buffer.from(packageStr, 'hex');
                    sPort = 8000;
                    return [4 /*yield*/, openConnect(sIp, sPort)];
                case 1:
                    iSocket = _a.sent();
                    console.log("connected to " + sIp + ":" + sPort);
                    return [4 /*yield*/, writeSocket(iSocket, dBinaryPacket)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, sleep(1000)];
                case 3:
                    _a.sent();
                    iSocket.destroy();
                    console.log("disconnected to " + sIp + ":" + sPort);
                    return [4 /*yield*/, sleep(3000)];
                case 4:
                    _a.sent(); //Give NTR enough time to start remoteplay
                    return [4 /*yield*/, openConnect(sIp, sPort)];
                case 5:
                    socket = _a.sent();
                    console.log("connected to " + sIp + ":" + sPort);
                    socket.destroy(); //We'll disconnect right after reconnecting to save bandwidth
                    console.log("disconnected to " + sIp + ":" + sPort);
                    return [2 /*return*/, true];
            }
        });
    });
}
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
function NTRRemoteplayReadJPEG(listener) {
    var iSocket = dgram_1.createSocket('udp4');
    var currentFrameId = -1;
    var frameList = [];
    iSocket.on('error', function (err) {
        console.log("server error:\n" + err.stack);
        listener(err);
    });
    iSocket.on('message', function (msg, rinfo) {
        console.log("server got: " + msg.length + " from " + rinfo.address + ":" + rinfo.port);
        var header = _NTRRemoteplayReadPacketHeader(msg);
        //first frame
        if (currentFrameId !== header.frameID) {
            if (frameList.length !== 0) {
                console.warn("drop frame " + currentFrameId);
                frameList = [];
            }
            currentFrameId = header.frameID;
        }
        console.log("push " + JSON.stringify(header));
        frameList.push({ header: header, content: msg.subarray(4) });
        if (header.lastOne) {
            //assemble
            // frameList.sort((a, b) => a.header.packetNum - b.header.packetNum);
            var packetNums = frameList.map(function (f) { return f.header.packetNum; }).join(",");
            console.log("assemble " + header.frameID + " " + packetNums);
            var jpegParts = frameList.map(function (f) { return f.content; });
            var jpeg = Buffer.concat(jpegParts);
            // const head = jpegStr.substr(0, 8).toUpperCase();
            // if (head !== '4A464946') {
            //     console.log(`head is wrong ${head}`);
            //     return;
            // }
            var verify = jpeg.subarray(jpeg.length - 2).toString('hex').toUpperCase();
            if (verify !== "FFD9") {
                console.log("verify is wrong " + verify);
                return;
            }
            // console.log(`${jpegStr}`);
            var oneFrame = {
                frameID: header.frameID,
                isTop: frameList[0].header.isTop,
                jpeg: jpeg,
            };
            listener(oneFrame);
            frameList = [];
        }
    });
    iSocket.on('listening', function () {
        var address = iSocket.address();
        console.log("server listening " + address.address + ":" + address.port);
    });
    iSocket.bind(8001);
    return function () {
        iSocket.close();
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
function _NTRRemoteplayReadPacketHeader(dPacket) {
    if (dPacket.length < 4) {
        throw new Error("dPacket length " + dPacket.length + " is too short"); //If $dPacket contains less than four bytes, abort (a NTR package needs to have at least 4 bytes)
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
    var frameID = dPacket.readUInt8(0);
    var lastOne = Boolean(dPacket.readInt8(1) >> 1);
    var isTop = Boolean(dPacket.readInt8(1) & 0x1);
    var packetNum = dPacket.readInt8(3);
    console.log("Packet received: frameID:" + frameID + ",lastOne:" + lastOne + ", isTop:" + isTop + ",packetNum:" + packetNum);
    return { frameID: frameID, lastOne: lastOne, isTop: isTop, packetNum: packetNum };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnRyLXJlbW90ZS1wbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3JjL250ci1yZW1vdGUtcGxheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJCQUFrRDtBQUNsRCwrQkFBd0Q7QUFHeEQsa0lBQWtJO0FBQ2xJLHVDQUF1QztBQUN2QyxnR0FBZ0c7QUFDaEcsa0lBQWtJO0FBQ2xJLHlGQUF5RjtBQUN6RixpSEFBaUg7QUFDakgsMEdBQTBHO0FBQzFHLDBGQUEwRjtBQUMxRiw2R0FBNkc7QUFDN0csc0NBQXNDO0FBQ3RDLCtDQUErQztBQUMvQyxnQ0FBZ0M7QUFDaEMsOEJBQThCO0FBQzlCLDhHQUE4RztBQUM5RywwR0FBMEc7QUFDMUcsMERBQTBEO0FBQzFELG1CQUFtQjtBQUNuQixvREFBb0Q7QUFDcEQsa0lBQWtJO0FBQ2xJLFNBQVMsaUJBQWlCLENBQUMsR0FBVSxFQUFFLEdBQVU7SUFDN0MsSUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQSxDQUFBLEVBQUU7SUFDOUIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzlDLENBQUM7QUFDRCxTQUFTLE1BQU0sQ0FBQyxHQUFVO0lBQ3RCLE9BQU8saUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFDRCxTQUFTLFdBQVcsQ0FBQyxFQUFTLEVBQUUsSUFBVztJQUN2QyxPQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07UUFDL0IsSUFBTSxNQUFNLEdBQWEsYUFBTyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUU7WUFDdkMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFD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