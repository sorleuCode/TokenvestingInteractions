import hre from "hardhat"
import {
    time
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";




async function main() {
    
    
    const [owner, user1, user2] = await hre.ethers.getSigners();

    const amountMintToContct =  hre.ethers.parseUnits("1000000000000", 18)

    const amountToclaim =   hre.ethers.parseUnits("100000", 18)



    const celoToken = await hre.ethers.getContractFactory("CeloToken");
    const celoTokenTx = await celoToken.deploy(owner.address)


    const tokenVesting = await hre.ethers.getContractFactory("TokenVesting");
    const tokenVestingTx = await tokenVesting.deploy(celoTokenTx);

    

    const tokenVestingInstance = await hre.ethers.getContractAt("TokenVesting", tokenVestingTx);
    const celoTokenInstance = await hre.ethers.getContractAt("CeloToken", celoTokenTx);


    // starting of scripting

    console.log("###### minting celoToken to the vestingToke  contract #######");


    const mintNairaToContract = await celoTokenInstance.connect(owner).mint(tokenVestingInstance.getAddress(), amountMintToContct);

    mintNairaToContract.wait();

    console.log({"NairaContractMint": mintNairaToContract});



    console.log("####### Adding Beneficiary ####");


    await tokenVestingInstance.addBeneficiary(user1.address, 60, 3600,  amountToclaim);


    console.log("checking user balance before claiming");

    const user1CeloBal = await celoTokenInstance.connect(user1).balanceOf(user1.address);

    console.log({"user1 celo balance before claim": user1CeloBal.toString()});



    console.log("##### getting user1 releasable amount after 1min of vesting period  #####");

    await time.increaseTo( await time.latest() + 60)

    const user1ReleasableAmount = await tokenVestingInstance.connect(user1).getReleasableAmount(user1.address);

    console.log({"User1 releasable amount": user1ReleasableAmount.toString()});



    console.log("##### user1 claiming after 1min  #####");

    await time.increaseTo( await time.latest() + 1000)

    const claiming1Tx = await tokenVestingInstance.connect(user1).claimTokens();

    claiming1Tx.wait();

    const user1CeloBalAfterClim1 = await celoTokenInstance.connect(user1).balanceOf(user1.address);


    console.log({"user1 balance after  first claiming": user1CeloBalAfterClim1.toString()});


    console.log("### user1 claiming all the the available allocation in time equal or above vesting period ####");

    await time.increaseTo( await time.latest() + 3600)

    const claimingAllTx = await tokenVestingInstance.connect(user1).claimTokens();

    claimingAllTx.wait();

    const user1CeloBalAfterClaimAll = await celoTokenInstance.connect(user1).balanceOf(user1.address);


    console.log({"user1 balance after claiming All": user1CeloBalAfterClaimAll.toString()});








    








    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1
})
