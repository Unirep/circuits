// The reason for the ts-ignore below is that if we are executing the code via `ts-node` instead of `hardhat`,
// it can not read the hardhat config and error ts-2503 will be reported.
// @ts-ignore
import assert from 'assert'
import { ethers } from 'ethers'
import Keyv from "keyv"
import { hash5, hashLeftRight, SparseMerkleTreeImpl, add0x, SnarkBigInt, hashOne } from '@unirep/crypto'
import { IncrementalQuinTree } from 'maci-crypto'
import { circuitEpochTreeDepth, circuitNullifierTreeDepth, circuitUserStateTreeDepth, } from '../config'

const SMT_ZERO_LEAF = hashLeftRight(BigInt(0), BigInt(0))
const SMT_ONE_LEAF = hashLeftRight(BigInt(1), BigInt(0))
const EPOCH_KEY_NULLIFIER_DOMAIN = BigInt(1)

interface IAttestation {
    attesterId: BigInt;
    posRep: BigInt;
    negRep: BigInt;
    graffiti: BigInt;
    hash(): BigInt;
}

class Attestation implements IAttestation {
    public attesterId: BigInt
    public posRep: BigInt
    public negRep: BigInt
    public graffiti: BigInt

    constructor(
        _attesterId: BigInt,
        _posRep: BigInt,
        _negRep: BigInt,
        _graffiti: BigInt,
    ) {
        this.attesterId = _attesterId
        this.posRep = _posRep
        this.negRep = _negRep
        this.graffiti = _graffiti
    }

    public hash = (): BigInt => {
        return hash5([
            this.attesterId,
            this.posRep,
            this.negRep,
            this.graffiti,
        ])
    }

    public toJSON = (space = 0): string => {
        return JSON.stringify(
            {
                attesterId: this.attesterId.toString(),
                posRep: this.posRep.toString(),
                negRep: this.negRep.toString(),
                graffiti: this.graffiti.toString(),
            },
            null,
            space
        )
    }
}

interface IReputation {
    posRep: BigInt;
    negRep: BigInt;
    graffiti: BigInt;
}

class Reputation implements IReputation {
    public posRep: BigInt
    public negRep: BigInt
    public graffiti: BigInt
    public graffitiPreImage: BigInt = BigInt(0)

    constructor(
        _posRep: BigInt,
        _negRep: BigInt,
        _graffiti: BigInt,
    ) {
        this.posRep = _posRep
        this.negRep = _negRep
        this.graffiti = _graffiti
    }

    public static default(): Reputation {
        return new Reputation(BigInt(0), BigInt(0), BigInt(0))
    }

    public update = (
        _posRep: BigInt,
        _negRep: BigInt,
        _graffiti: BigInt,
    ): Reputation => {
        this.posRep = BigInt(Number(this.posRep) + Number(_posRep))
        this.negRep = BigInt(Number(this.negRep) + Number(_negRep))
        if(_graffiti != BigInt(0)){
            this.graffiti = _graffiti
        }
        return this
    }

    public addGraffitiPreImage = (_graffitiPreImage: BigInt) => {
        assert(hashOne(_graffitiPreImage) === this.graffiti, 'Graffiti pre-image does not match')
        this.graffitiPreImage = _graffitiPreImage
    }

    public hash = (): BigInt => {
        return hash5([
            this.posRep,
            this.negRep,
            this.graffiti,
            BigInt(0),
            BigInt(0),
        ])
    }

    public toJSON = (space = 0): string => {
        return JSON.stringify(
            {
                posRep: this.posRep.toString(),
                negRep: this.negRep.toString(),
                graffiti: this.graffiti.toString(),
                graffitiPreImage: this.graffitiPreImage.toString()
            },
            null,
            space
        )
    }
}

const toCompleteHexString = (str: string, len?: number): string => {
    str = add0x(str)
    if (len) str = ethers.utils.hexZeroPad(str, len)
    return str
}

const genNewSMT = async (treeDepth: number, defaultLeafHash: BigInt) => {
    return SparseMerkleTreeImpl.create(
        new Keyv(),
        treeDepth,
        defaultLeafHash,
    )
}

const genNewEpochTree = async (_epochTreeDepth: number = circuitEpochTreeDepth) => {
    const defaultOTSMTHash = SMT_ONE_LEAF
    return genNewSMT(_epochTreeDepth, defaultOTSMTHash)
}

const genNewNullifierTree = async (_nullifierTreeDepth: number = circuitNullifierTreeDepth) => {
    const nullifierTree = await genNewSMT(_nullifierTreeDepth, SMT_ZERO_LEAF)
    // Reserve leaf 0
    await nullifierTree.update(BigInt(0), SMT_ONE_LEAF)
    return nullifierTree
}

const defaultUserStateLeaf = hash5([BigInt(0), BigInt(0), BigInt(0), BigInt(0), BigInt(0)])

const computeEmptyUserStateRoot = (treeDepth: number): BigInt => {
    const t = new IncrementalQuinTree(
        treeDepth,
        defaultUserStateLeaf,
        2,
    )
    return t.root
}    

const genNewUserStateTree = async (_userStateTreeDepth: number = circuitUserStateTreeDepth) => {
    return genNewSMT(_userStateTreeDepth, defaultUserStateLeaf)
}

const genEpochKey = (identityNullifier: SnarkBigInt, epoch: number, nonce: number, _epochTreeDepth: number = circuitEpochTreeDepth): SnarkBigInt => {
    const values: any[] = [
        identityNullifier,
        epoch,
        nonce,
        BigInt(0),
        BigInt(0),
    ]
    let epochKey = hash5(values).toString()
    // Adjust epoch key size according to epoch tree depth
    const epochKeyModed = BigInt(epochKey) % BigInt(2 ** _epochTreeDepth)
    return epochKeyModed
}

const genEpochKeyNullifier = (identityNullifier: SnarkBigInt, epoch: number, nonce: number, _nullifierTreeDepth: number = circuitNullifierTreeDepth): SnarkBigInt => {
    let nullifier = hash5([EPOCH_KEY_NULLIFIER_DOMAIN, identityNullifier, BigInt(epoch), BigInt(nonce), BigInt(0)]).toString()
    // Adjust epoch key size according to epoch tree depth
    const nullifierModed = BigInt(nullifier) % BigInt(2 ** _nullifierTreeDepth)
    return nullifierModed
}

export {
    Attestation,
    Reputation,
    SMT_ONE_LEAF,
    SMT_ZERO_LEAF,
    computeEmptyUserStateRoot,
    defaultUserStateLeaf,
    genNewEpochTree,
    genNewNullifierTree,
    genNewUserStateTree,
    genNewSMT,
    toCompleteHexString,
    genEpochKey,
    genEpochKeyNullifier,
}