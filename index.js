const express = require('express')
const ethers = require('ethers');
const Multicall = require('@0xsequence/multicall')
const app = express()
const port = 3200

const url = 'https://api.roninchain.com/rpc';
const provider = new ethers.providers.JsonRpcProvider(url)
const multicallprovider = new Multicall.providers.MulticallProvider(provider)

DEFAULT_CONF = {
    contract: "0xc76d0d0d3aa608190f78db02bf2f5aef374fc0b9"
}

const config = {
    rpcUrl: 'https://api.roninchain.com/rpc',
    multicallAddress: '0xc76d0d0d3aa608190f78db02bf2f5aef374fc0b9'
};

const landABI = require("./LandContract.json")
const landStakingManagerABI = require("./LandStakingManager.json")
const landStakingPoolABI = require("./LandStakingPool.json")
const landContract = new ethers.Contract('0x8c811e3c958e190f5ec15fb376533a3398620500', landABI, provider);
const landStakingManagerContract = new ethers.Contract('0x7f27E35170472E7f107d3e55C2B9bCd44aA01dD5', landStakingManagerABI, provider);
const landStakingPoolContract = new ethers.Contract('0xb2a5110f163ec592f8f0d4207253d8cbc327d9fb', landStakingPoolABI, provider);


app.get('/land/:address', async (req, res) => {
    const address = req.params.address
    if (address) {
        console.log(address)
        const landList = await landStakingPoolContract.getStakedLands(address);
        const arr = []
        for (var i = 0; i < landList.length; i++) {
            arr.push(landContract.decodeTokenId(landList[i]))
        }
        const lands = await Promise.all(arr)
        const data = []
        lands.forEach(item => {
            data.push({ row: Number(item._row), col: Number(item._col) })
        })
        let results = {}
        results.address = address
        results.lands = data
        res.status(200).send(results)
    } else {
        res.status(404).send('Missing address')
    }

})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

module.exports = app;