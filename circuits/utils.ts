import * as path from 'path'
const snarkjs = require('snarkjs')
import verifyEpochKeyVkey from '../build/verifyEpochKey.vkey.json'
import proveReputationVkey from '../build/proveReputation.vkey.json'
import proveUserSignUpVkey from '../build/proveUserSignUp.vkey.json'
import startTransitionVkey from '../build/startTransition.vkey.json'
import processAttestationsVkey from '../build/processAttestations.vkey.json'
import userStateTransitionVkey from '../build/userStateTransition.vkey.json'

const buildPath = "../build"

const executeCircuit = async (
    circuit: any,
    inputs: any,
) => {

    const witness = await circuit.calculateWitness(inputs, true)
    await circuit.checkConstraints(witness)
    await circuit.loadSymbols()

    return witness
}

const getVKey = async (
    circuitName: string
) => {
    if (circuitName == 'verifyEpochKey'){
        return verifyEpochKeyVkey
    } else if (circuitName == 'proveReputation'){
        return proveReputationVkey
    } else if (circuitName == 'proveUserSignUp'){
        return proveUserSignUpVkey
    } else if (circuitName == 'startTransition'){
        return startTransitionVkey
    } else if (circuitName == 'processAttestations'){
        return processAttestationsVkey
    } else if (circuitName == 'userStateTransition'){
        return userStateTransitionVkey
    } else {
        console.log(`"${circuitName}" not found. Valid circuit name: verifyEpochKey, proveReputation, proveUserSignUp, startTransition, processAttestations, userStateTransition`)
        return
    }
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
    if(circuitName != 'verifyEpochKey' && circuitName != 'proveReputation' && circuitName != 'proveUserSignUp' && circuitName != 'startTransition' && circuitName != 'processAttestations' && circuitName != 'userStateTransition') {
        console.log(`"${circuitName}" not found. Valid circuit name: verifyEpochKey, proveReputation, proveUserSignUp, startTransition, processAttestations, userStateTransition`)
        return { }
    }
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
    const vkey = await getVKey(circuitName)
    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
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
    executeCircuit,
    formatProofForVerifierContract,
    getVKey,
    getSignalByName,
    genProofAndPublicSignals,
    verifyProof,
}