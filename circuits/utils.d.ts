declare enum CircuitName {
    verifyEpochKey = "verifyEpochKey",
    proveReputation = "proveReputation",
    proveUserSignUp = "proveUserSignUp",
    startTransition = "startTransition",
    processAttestations = "processAttestations",
    userStateTransition = "userStateTransition"
}
declare const executeCircuit: (circuit: any, inputs: any) => Promise<any>;
declare const getVKey: (circuitName: CircuitName) => Promise<{
    protocol: string;
    curve: string;
    nPublic: number;
    vk_alpha_1: string[];
    vk_beta_2: string[][];
    vk_gamma_2: string[][];
    vk_delta_2: string[][];
    vk_alphabeta_12: string[][][];
    IC: string[][];
} | undefined>;
declare const getSignalByName: (circuit: any, witness: any, signal: string) => any;
declare const genProofAndPublicSignals: (circuitName: CircuitName, inputs: any) => Promise<{
    proof: any;
    publicSignals: any;
}>;
declare const verifyProof: (circuitName: CircuitName, proof: any, publicSignals: any) => Promise<boolean>;
declare const formatProofForVerifierContract: (_proof: any) => any[];
export { CircuitName, executeCircuit, formatProofForVerifierContract, getVKey, getSignalByName, genProofAndPublicSignals, verifyProof, };
