const numEpochKeyNoncePerEpoch = 3;

const numAttestationsPerProof = 5;

const circuitGlobalStateTreeDepth = 4;

const circuitUserStateTreeDepth = 4;

const circuitEpochTreeDepth = 32;

const circuitNullifierTreeDepth = 128;

const maxReputationBudget = 10;

const maxUsers = 2 ** circuitGlobalStateTreeDepth - 1;

export {
    circuitGlobalStateTreeDepth,
    circuitUserStateTreeDepth,
    circuitEpochTreeDepth,
    circuitNullifierTreeDepth,
    numEpochKeyNoncePerEpoch,
    numAttestationsPerProof,
    maxUsers,
    maxReputationBudget,
}