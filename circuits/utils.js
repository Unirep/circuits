"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProof = exports.genProofAndPublicSignals = exports.getSignalByName = exports.getVKey = exports.formatProofForVerifierContract = exports.executeCircuit = exports.CircuitName = void 0;
const path = __importStar(require("path"));
const snarkjs = require('snarkjs');
const verifyEpochKey_vkey_json_1 = __importDefault(require("../build/verifyEpochKey.vkey.json"));
const proveReputation_vkey_json_1 = __importDefault(require("../build/proveReputation.vkey.json"));
const proveUserSignUp_vkey_json_1 = __importDefault(require("../build/proveUserSignUp.vkey.json"));
const startTransition_vkey_json_1 = __importDefault(require("../build/startTransition.vkey.json"));
const processAttestations_vkey_json_1 = __importDefault(require("../build/processAttestations.vkey.json"));
const userStateTransition_vkey_json_1 = __importDefault(require("../build/userStateTransition.vkey.json"));
const buildPath = "../build";
var CircuitName;
(function (CircuitName) {
    CircuitName["verifyEpochKey"] = "verifyEpochKey";
    CircuitName["proveReputation"] = "proveReputation";
    CircuitName["proveUserSignUp"] = "proveUserSignUp";
    CircuitName["startTransition"] = "startTransition";
    CircuitName["processAttestations"] = "processAttestations";
    CircuitName["userStateTransition"] = "userStateTransition";
})(CircuitName || (CircuitName = {}));
exports.CircuitName = CircuitName;
const executeCircuit = async (circuit, inputs) => {
    const witness = await circuit.calculateWitness(inputs, true);
    await circuit.checkConstraints(witness);
    await circuit.loadSymbols();
    return witness;
};
exports.executeCircuit = executeCircuit;
const getVKey = async (circuitName) => {
    if (circuitName == CircuitName.verifyEpochKey) {
        return verifyEpochKey_vkey_json_1.default;
    }
    else if (circuitName == CircuitName.proveReputation) {
        return proveReputation_vkey_json_1.default;
    }
    else if (circuitName == CircuitName.proveUserSignUp) {
        return proveUserSignUp_vkey_json_1.default;
    }
    else if (circuitName == CircuitName.startTransition) {
        return startTransition_vkey_json_1.default;
    }
    else if (circuitName == CircuitName.processAttestations) {
        return processAttestations_vkey_json_1.default;
    }
    else if (circuitName == CircuitName.userStateTransition) {
        return userStateTransition_vkey_json_1.default;
    }
    else {
        console.log(`"${circuitName}" not found. Valid circuit name: verifyEpochKey, proveReputation, proveUserSignUp, startTransition, processAttestations, userStateTransition`);
        return;
    }
};
exports.getVKey = getVKey;
const getSignalByName = (circuit, witness, signal) => {
    return witness[circuit.symbols[signal].varIdx];
};
exports.getSignalByName = getSignalByName;
const genProofAndPublicSignals = async (circuitName, inputs) => {
    const circuitWasmPath = path.join(__dirname, buildPath, `${circuitName}.wasm`);
    const zkeyPath = path.join(__dirname, buildPath, `${circuitName}.zkey`);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, circuitWasmPath, zkeyPath);
    return { proof, publicSignals };
};
exports.genProofAndPublicSignals = genProofAndPublicSignals;
const verifyProof = async (circuitName, proof, publicSignals) => {
    const vkey = await getVKey(circuitName);
    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    return res;
};
exports.verifyProof = verifyProof;
const formatProofForVerifierContract = (_proof) => {
    return ([
        _proof.pi_a[0],
        _proof.pi_a[1],
        _proof.pi_b[0][1],
        _proof.pi_b[0][0],
        _proof.pi_b[1][1],
        _proof.pi_b[1][0],
        _proof.pi_c[0],
        _proof.pi_c[1],
    ]).map((x) => x.toString());
};
exports.formatProofForVerifierContract = formatProofForVerifierContract;
