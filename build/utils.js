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
exports.verifyProof = exports.genProofAndPublicSignals = exports.getSignalByName = exports.getVKey = exports.formatProofForVerifierContract = exports.executeCircuit = void 0;
const path = __importStar(require("path"));
const snarkjs = require('snarkjs');
const node_fetch_1 = __importDefault(require("node-fetch"));
const buildPath = "../build";
const executeCircuit = async (circuit, inputs) => {
    const witness = await circuit.calculateWitness(inputs, true);
    await circuit.checkConstraints(witness);
    await circuit.loadSymbols();
    return witness;
};
exports.executeCircuit = executeCircuit;
const getVKey = async (circuitName) => {
    const vkeyJsonPath = path.join(__dirname, buildPath, `${circuitName}.vkey.json`);
    const vkey = await node_fetch_1.default(vkeyJsonPath).then(function (res) {
        return res.json();
    });
    return vkey;
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
