const NftMarket = artifacts.require("NftMarket");
const { ethers } = require("ethers");

contract("NftMarket", accounts => {
    let _contract = null;
    let _nftPrice = ethers.utils.parseEther("0.3").toString();
    let _listingPrice = ethers.utils.parseEther("0.025").toString();

    before(async () => {
        _contract = await NftMarket.deployed();
    })

    describe("Mint token", () => {
        const tokenURI = "https://test.com"
        before(async () => {
            await _contract.mintToken(tokenURI, _nftPrice, {
                from: accounts[0],
                value: _listingPrice
            });
        })
        it("owner of the first token should be address[0]", async () => {
            const owner = await _contract.ownerOf(1);
            assert(owner == accounts[0] , "Addr of owner is not address[0]");
        })

        it("first token should point to the coreect tokenURI", async () => {
            const actualTokenURI = await _contract.tokenURI(1);
            assert.equal(actualTokenURI, tokenURI, "tokenURI is not correctly set!")
        })

        it("should not be possible to create a NFT with used token URI", async () => {
            try{
                await _contract.mintToken(tokenURI, _nftPrice, {
                    from: accounts[0]
                });
            }catch (error) {
                assert(error, "NFT was minted with prev used tokenURI");
            }

        })

        it("should have one listed item ", async () => {
            const listedItemCount = await _contract.listedItemsCount();
            assert.equal(listedItemCount.toNumber(), 1, "Listed items count is not 1");
        })

        it("should have created NFT item ", async () => {
            const nftItem = await _contract.getNftItem(1);
            assert.equal(nftItem.tokenId, 1, "Token id is not 1");
            assert.equal(nftItem.price, _nftPrice, "Price is wrong");
            assert.equal(nftItem.creator, accounts[0], "Creator addr is not account[0]");
            assert.equal(nftItem.isListed, true, "Token is not listed");

        })
    })

    describe("Buy NFT", () => {
        before(async () => {
            await _contract.buyNft(1, {
                from: accounts[1],
                value: _nftPrice
            });
        })

        it("should unlist the item", async () => {
            const listedItem = await _contract.getNftItem(1);
            assert.equal(listedItem.isListed, false, "Item is still listed");
        })

        it("should decrease listed items count", async () => {
            const listedItemCount = await _contract.listedItemsCount();
            assert.equal(listedItemCount.toNumber(), 0, "Count should be 0");
        })

        it("should change the owner", async () => {
            const currentOwner = await _contract.ownerOf(1);
            assert.equal(currentOwner, accounts[1], "addr of current owner should be accounts[1]");
        })
    })

    describe("Token transfers", () => {
        const tokenURI = "https:///test-json-2.com"
        before(async () => {
            await _contract.mintToken(tokenURI, _nftPrice, {
                from: accounts[0],
                value: _listingPrice
            })
        })

        it("should have two NFTs created", async () => {
            const totalSupply = await _contract.totalSupply()
            assert.equal(totalSupply.toNumber(), 2, "The total supply should be 2");
        })

        it("should be able to retrieve NFT by index", async () => {
            const nftId1 = await _contract.tokenByIndex(0);
            const nftId2 = await _contract.tokenByIndex(1);
            assert.equal(nftId1.toNumber(), 1, "Should get 1");
            assert.equal(nftId2.toNumber(), 2, "Should get 2");
        })

        it("should have one listed NFT", async () => {
            const allNftsOnSale = await _contract.getAllNftsOnSale()
            assert.equal(allNftsOnSale[0].tokenId, 2, "Wrong tokenId");
        })

        it("account[0] should have one owned NFT", async () => {
            const ownedNfts = await _contract.getOwnedNfts({
                from: accounts[0]
            });
            assert.equal(ownedNfts[0].tokenId, 2, "Wrong tokenId");
        })

        it("account[1] should have one owned NFT", async () => {
            const ownedNfts = await _contract.getOwnedNfts({
                from: accounts[1]
            });
            assert.equal(ownedNfts[0].tokenId, 1, "Wrong tokenId");
        })
    })

    describe("Token transfer to new owner", () => {
        before (async () => {
            await _contract.transferFrom(
                accounts[0],
                accounts[1],
                2
            )
        })

        it("accounts[0] should own 0 tokens", async () => {
            const ownedNfts = await _contract.getOwnedNfts({
                from: accounts[0]
            });
            assert.equal(ownedNfts.length, 0, "Should be 0");
        })


        it("accounts[1] should own 2 tokens", async () => {
            const ownedNfts = await _contract.getOwnedNfts({
                from: accounts[1]
            });
            assert.equal(ownedNfts.length, 2, "Should be 2");
        })

        
    })
    describe("List an NFT", () => {
        before(async () => {
            await _contract.placeNftOnSale(
                1,
                _nftPrice, 
                { from: accounts[1], value: _listingPrice}
            )
        })
        
        it("Should have 2 listed items", async () => {
            const listedNfts = await _contract.getAllNftsOnSale();
            assert.equal(listedNfts.length, 2, "should have 2 listed NFTs");
        })

        it("setListingPrice should work ", async () => {
            const listedNfts = await _contract.setListingPrice(_listingPrice) // {from: accounts[0]} provided by default

            const listingPrice = await _contract.listingPrice();
            assert.equal(listingPrice.toString(), _listingPrice, "doesn't work");
        })
    })
})