import * as path from 'path'
import { expect } from "chai"
import { compileAndLoadCircuit, executeCircuit, } from "../circuits/utils"
import { genRandomSalt, hashLeftRight, SnarkBigInt, } from "@unirep/crypto"

describe('Hash chain circuit', function () {
    this.timeout(10000)
    let circuit

    const NUM_ELEMENT = 10
    let elements: SnarkBigInt[] = []
    let cur: BigInt = BigInt(0), result, selectors: number[] = []

    before(async () => {
        const circuitPath = path.join(__dirname, '../circuits/test/verifyHashChain_test.circom')
        circuit = await compileAndLoadCircuit(circuitPath)

        for (let i = 0; i < NUM_ELEMENT; i++) {
            const element = genRandomSalt()
            const sel = Math.floor(Math.random() * 2)
            selectors.push(sel)
            elements.push(element)
            if ( sel == 1) {
                cur = hashLeftRight(element, cur)
            }
        }
        result = hashLeftRight(BigInt(1), cur)
    })

    it('correctly verify hash chain', async () => {
        const circuitInputs = {
            hashes: elements,
            selectors: selectors,
            result: result
        }

        const witness = await executeCircuit(circuit, circuitInputs)
    })

    it('verify incorrect elements should fail', async () => {
        elements.reverse()
        const circuitInputs = {
            hashes: elements,
            selectors: selectors,
            result: result
        }

        let error
        try {
            await executeCircuit(circuit, circuitInputs)
        } catch (e) {
            error = e
            expect(true).to.be.true
        } finally {
            if (!error) throw Error("Wrong hashes should throw error")
        }
        elements.reverse()
    })

    it('verify with incorrect selectors should fail', async () => {
        const wrongSelectors = selectors.slice()
        // Flip one of the selector
        const indexWrongSelector = Math.floor(Math.random() * NUM_ELEMENT)
        wrongSelectors[indexWrongSelector] = wrongSelectors[indexWrongSelector] ? 0 : 1
        const circuitInputs = {
            hashes: elements,
            selectors: wrongSelectors,
            result: result
        }

        let error
        try {
            await executeCircuit(circuit, circuitInputs)
        } catch (e) {
            error = e
            expect(true).to.be.true
        } finally {
            if (!error) throw Error("Wrong selectors should throw error")
        }
    })

    it('verify incorrect number of elements should fail', async () => {
        const circuitInputs = {
            hashes: elements.slice(1),
            selectors: selectors,
            result: result
        }

        let error
        try {
            await executeCircuit(circuit, circuitInputs)
        } catch (e) {
            error = e
            expect(true).to.be.true
        } finally {
            if (!error) throw Error("Wrong number of hashes should throw error")
        }
    })

    it('verify incorrect result should fail', async () => {
        const incorrectResult = genRandomSalt()
        const circuitInputs = {
            hashes: elements,
            selectors: selectors,
            result: incorrectResult
        }

        let error
        try {
            await executeCircuit(circuit, circuitInputs)
        } catch (e) {
            error = e
            expect(true).to.be.true
        } finally {
            if (!error) throw Error("Wrong hash chain result should throw error")
        }
    })
})