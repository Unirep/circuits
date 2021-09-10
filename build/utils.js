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
exports.__esModule = true;
exports.verifyProof = exports.genProofAndPublicSignals = exports.getSignalByName = exports.getVKey = exports.formatProofForVerifierContract = exports.executeCircuit = exports.compileAndLoadCircuit = void 0;
var fs = require("fs");
var path = require("path");
var circom = require('circom');
var snarkjs = require('snarkjs');
var buildPath = "../build";
/*
 * @param circuitPath The subpath to the circuit file (e.g.
 *     test/userStateTransition_test.circom)
 */
var compileAndLoadCircuit = function (circuitPath) { return __awaiter(void 0, void 0, void 0, function () {
    var circuit;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, circom.tester(path.join(__dirname, "../circuits/" + circuitPath))];
            case 1:
                circuit = _a.sent();
                return [4 /*yield*/, circuit.loadSymbols()];
            case 2:
                _a.sent();
                return [2 /*return*/, circuit];
        }
    });
}); };
exports.compileAndLoadCircuit = compileAndLoadCircuit;
var executeCircuit = function (circuit, inputs) { return __awaiter(void 0, void 0, void 0, function () {
    var witness;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, circuit.calculateWitness(inputs, true)];
            case 1:
                witness = _a.sent();
                return [4 /*yield*/, circuit.checkConstraints(witness)];
            case 2:
                _a.sent();
                return [4 /*yield*/, circuit.loadSymbols()];
            case 3:
                _a.sent();
                return [2 /*return*/, witness];
        }
    });
}); };
exports.executeCircuit = executeCircuit;
var getVKey = function (circuitName) {
    var vkeyJsonPath = path.join(__dirname, buildPath, circuitName + ".vkey.json");
    return JSON.parse(fs.readFileSync(vkeyJsonPath).toString());
};
exports.getVKey = getVKey;
var getSignalByName = function (circuit, witness, signal) {
    return witness[circuit.symbols[signal].varIdx];
};
exports.getSignalByName = getSignalByName;
var genProofAndPublicSignals = function (circuitName, inputs) { return __awaiter(void 0, void 0, void 0, function () {
    var circuitWasmPath, zkeyPath, _a, proof, publicSignals;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                circuitWasmPath = path.join(__dirname, buildPath, circuitName + ".wasm");
                zkeyPath = path.join(__dirname, buildPath, circuitName + ".zkey");
                return [4 /*yield*/, snarkjs.groth16.fullProve(inputs, circuitWasmPath, zkeyPath)];
            case 1:
                _a = _b.sent(), proof = _a.proof, publicSignals = _a.publicSignals;
                return [2 /*return*/, { proof: proof, publicSignals: publicSignals }];
        }
    });
}); };
exports.genProofAndPublicSignals = genProofAndPublicSignals;
var verifyProof = function (circuitName, proof, publicSignals) { return __awaiter(void 0, void 0, void 0, function () {
    var vkeyJsonPath, vKey, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                vkeyJsonPath = path.join(__dirname, buildPath, circuitName + ".vkey.json");
                vKey = JSON.parse(fs.readFileSync(vkeyJsonPath).toString());
                return [4 /*yield*/, snarkjs.groth16.verify(vKey, publicSignals, proof)];
            case 1:
                res = _a.sent();
                return [2 /*return*/, res];
        }
    });
}); };
exports.verifyProof = verifyProof;
var formatProofForVerifierContract = function (_proof) {
    return ([
        _proof.pi_a[0],
        _proof.pi_a[1],
        _proof.pi_b[0][1],
        _proof.pi_b[0][0],
        _proof.pi_b[1][1],
        _proof.pi_b[1][0],
        _proof.pi_c[0],
        _proof.pi_c[1],
    ]).map(function (x) { return x.toString(); });
};
exports.formatProofForVerifierContract = formatProofForVerifierContract;
//# sourceMappingURL=utils.js.map