const express = require('express')
const cors = require('cors')
const Web3 = require('web3');
const app = express()
const port = 3200

const url = 'https://api.roninchain.com/rpc';
const web3 = new Web3(new Web3.providers.HttpProvider(url))

const landTypes = ["Savannah", "Forest", "Artic", "Mystic", "Genesis"]
const landGridData = require("./Land_Grid_Data_Multiplier.json")
const landABI = require("./LandContract.json")
const landStakingPoolABI = require("./LandStakingPool.json")
const landContract = new web3.eth.Contract(landABI, '0x8c811e3c958e190f5ec15fb376533a3398620500');
const landStakingPoolContract = new web3.eth.Contract(landStakingPoolABI, '0xb2a5110f163ec592f8f0d4207253d8cbc327d9fb');

var corsOptionsDelegate = function (req, callback) {
    callback(null, { origin: true })
}
app.use(cors(corsOptionsDelegate))

const findLand = (row, col) => {
    return landGridData.find(item => item.row === row && item.col === col)
}
app.get('/land/:address', async (req, res) => {
    try {
        const address = Web3.utils.toChecksumAddress(req.params.address.replace('ronin:', '0x'))
        if (address && Web3.utils.isAddress(address)) {
            const landList = await landStakingPoolContract.methods.getStakedLands(address).call();
            const landListWallet = await landContract.methods.landOfOwner(address).call();
            const results = { address: address, stakedStats: [], owned: [], staked: [] }
            const tempArr = []
            for (var i = 0; i < landList.length; i++) {
                tempArr.push(landContract.methods.decodeTokenId(landList[i]).call())
            }
            const lands = await Promise.all(tempArr)
            lands.forEach(item => {
                results.staked.push(findLand(Number(item._row), Number(item._col)))
            })
            for (var i = 0; i < landListWallet[0].length; i++) {
                results.owned.push(findLand(Number(landListWallet[0][i]), Number(landListWallet[1][i])))
            }
            res.status(200).send(results)
        } else {
            res.status(404).send('Missing address')
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err.message)
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

module.exports = app;