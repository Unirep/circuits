declare const executeCircuit: (circuit: any, inputs: any) => Promise<any>;
declare const getVKey: (circuitName: string) => Promise<{
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
declare const genProofAndPublicSignals: (circuitName: string, inputs: any) => Promise<{
    proof?: undefined;
    publicSignals?: undefined;
} | {
    proof: any;
    publicSignals: any;
}>;
declare const verifyProof: (circuitName: string, proof: any, publicSignals: any) => Promise<boolean>;
declare const formatProofForVerifierContract: (_proof: any) => any[];
export { executeCircuit, formatProofForVerifierContract, getVKey, getSignalByName, genProofAndPublicSignals, verifyProof, };
