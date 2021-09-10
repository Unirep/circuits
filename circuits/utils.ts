import * as fs from 'fs'
import * as path from 'path'
const circom = require('circom')
const snarkjs = require('snarkjs')

const buildPath = "../build"

/*
 * @param circuitPath The subpath to the circuit file (e.g.
 *     test/userStateTransition_test.circom)
 */
const compileAndLoadCircuit = async (
    circuitPath: string
) => {
    const circuit = await circom.tester(circuitPath)

    await circuit.loadSymbols()

    return circuit
}

const executeCircuit = async (
    circuit: any,
    inputs: any,
) => {

    const witness = await circuit.calculateWitness(inputs, true)
    await circuit.checkConstraints(witness)
    await circuit.loadSymbols()

    return witness
}

const getVKey = (
    circuitName: string
) => {
    const vkeyJsonPath = path.join(__dirname, buildPath,`${circuitName}.vkey.json`)
    return JSON.parse(fs.readFileSync(vkeyJsonPath).toString());
}

const getSignalByName = (
    circuit: any,
    witness: any,
    signal: string,
) => {

    return witness[circuit.symbols[signal].varIdx]
}

const genProofAndPublicSignals = async (
    circuitName: string,
    inputs: any,
) => {
    const circuitWasmPath = path.join(__dirname, buildPath, `${circuitName}.wasm`)
    const zkeyPath = path.join(__dirname, buildPath,`${circuitName}.zkey`)
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, circuitWasmPath, zkeyPath);

    return { proof, publicSignals }
}

const verifyProof = async (
    circuitName: string,
    proof: any,
    publicSignals: any,
): Promise<boolean> => {
    const vkeyJsonPath = path.join(__dirname, buildPath,`${circuitName}.vkey.json`)
    const vKey = JSON.parse(fs.readFileSync(vkeyJsonPath).toString());
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    return res
}

const formatProofForVerifierContract = (
    _proof: any,
) => {

    return ([
        _proof.pi_a[0],
        _proof.pi_a[1],
        _proof.pi_b[0][1],
        _proof.pi_b[0][0],
        _proof.pi_b[1][1],
        _proof.pi_b[1][0],
        _proof.pi_c[0],
        _proof.pi_c[1],
    ]).map((x) => x.toString())
}

export {
    compileAndLoadCircuit,
    executeCircuit,
    formatProofForVerifierContract,
    getVKey,
    getSignalByName,
    genProofAndPublicSignals,
    verifyProof,
}