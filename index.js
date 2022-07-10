const express = require('express')
const ethers = require('ethers');
const { toChecksumAddress } = require('ethereum-checksum-address')
const app = express()
const port = 3200

const url = 'https://api.roninchain.com/rpc';
const provider = new ethers.providers.JsonRpcProvider(url)

const landTypes = require("./LandList.json")
const landABI = require("./LandContract.json")
const landStakingPoolABI = require("./LandStakingPool.json")
const landContract = new ethers.Contract('0x8c811e3c958e190f5ec15fb376533a3398620500', landABI, provider);
const landStakingPoolContract = new ethers.Contract('0xb2a5110f163ec592f8f0d4207253d8cbc327d9fb', landStakingPoolABI, provider);
app.get('/land/:address', async (req, res) => {
    const address = toChecksumAddress(req.params.address)
    if (address && ethers.utils.isAddress(address)) {
        let x = await (landContract.getEstateData("-67","-84"))
        const landList = await landStakingPoolContract.getStakedLands(address);
        const results = { address: address, lands: [] }
        const tempArr = []

        for (var i = 0; i < landList.length; i++) {
            tempArr.push(landContract.decodeTokenId(landList[i]))
        }
        const lands = await Promise.all(tempArr)
        lands.forEach(item => {
            
            results.lands.push(landTypes.find(x => x.col === Number(item._col) && x.row === Number(item._row)))
        })
        const tempArr2 = []
        for (var i = 0; i < results.lands.length; i++) {
            console.log(Number(results.lands[i].row), Number(results.lands[i].col))
            tempArr2.push(landContract.getEstateData(Number(results.lands[i].row).toString(), Number(results.lands[i].col).toString()))
        }
        const lands2 = await Promise.all(tempArr2)
        //console.log(lands2)
        res.status(200).send(results)
    } else {
        res.status(404).send('Missing address')
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

module.exports = app;