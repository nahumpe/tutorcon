import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const MPContractAddress = "0x31A8F10C6465F5A2e1534485CbfaB4eD044ff917"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let posts = []
let tutors = []
let hires = []
let user
let hireIn

const subjects = ["Math", "Science", "History", "Language", "Physics"]

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getData = async function() {
  const _postsLength = await contract.methods.getPostsLength().call()
  const _posts = []
  for (let i = 0; i < _postsLength; i++) {
    let _post = new Promise(async (resolve, reject) => {
      let p = await contract.methods.getPost(i).call()
      resolve({
        index: i,
        tutorIndex: p[0],
        title: p[1],
        description: p[2],
        subject: p[3],
        price: new BigNumber(p[4])
      })
    })
    _posts.push(_post)
  }
  posts = await Promise.all(_posts)

  const _tutorsLength = await contract.methods.getTutorsLength().call()
  const _tutors = []
  for (let i = 0; i < _tutorsLength; i++) {
    let _tutor = new Promise(async (resolve, reject) => {
      let p = await contract.methods.getTutor(i).call()
      resolve({
        index: i,
        profile: p[0],
        name: p[1],
        posts: p[2]
      })
    })
    _tutors.push(_tutor)
  }
  tutors = await Promise.all(_tutors)

  document.getElementById("registerBtn").style.display = checkRegistered() ? "none" : "initial"
  document.getElementById("postBtn").style.display = checkRegistered() ? "initial" : "none"

  renderPosts()
}

function checkRegistered(){
  for(let i of tutors){
    if(i.profile == kit.defaultAccount){
      user = i
      return true;
    }
  }
  return false;
}

function renderPosts() {
  document.getElementById("marketplace").innerHTML = ""
  posts.forEach((_post) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = productTemplate(_post)
    document.getElementById("marketplace").appendChild(newDiv)
  })
}

function productTemplate(_post) {
  return `
    <div class="card mb-4">
      <div class="card-body text-left p-4 position-relative">
        <h2 class="card-title fs-4 fw-bold mt-2">${_post.title}</h2>
        <p class="text-muted">
          ${subjects[_post.subject]}             
        </p>
        <p class="card-text">
          ${_post.description}             
        </p>
        <div class="d-grid gap-1">
          <a class="btn btn-lg btn-outline-dark fs-6 p-3 setHire" data-bs-toggle="modal" data-bs-target="#hireModal" id=${
            _post.index
          }>
            Hire for ${_post.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD / h
          </a>
        </div>
      </div>
    </div>
  `
}

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getData()
  notificationOff()
});

document
  .querySelector("#newProductBtn")
  .addEventListener("click", async (e) => {
    const params = [
      user.index,
      document.getElementById("newSerTitle").value,
      document.getElementById("newSerDescription").value,
      document.getElementById("selectSubject").value,
      new BigNumber(document.getElementById("newPrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString()
    ]
    notification(`⌛ Adding "${params[1]}"...`)
    try {
      const result = await contract.methods
        .addPost(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[1]}".`)
    getData()
  })

document.querySelector("#newTutorBtn").addEventListener("click", async (e) => {
  const name = document.getElementById("newTutorName").value
  notification(`⌛ Registering tutor...`)
  try {
    const result = await contract.methods
      .registerTutor(name)
      .send({ from: kit.defaultAccount })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`🎉 You successfully registered as "${name}".`)
  getData()
})

document.querySelector("#marketplace").addEventListener("click", async (e) => {
  if (e.target.className.includes("setHire")) {
    const index = e.target.id
    hireIn = index
  }
})  

document.querySelector("#hireBtn").addEventListener("click", async (e) => {
  const hours = document.getElementById("hoursInput").value

  const params = [
    parseInt(hireIn),
    parseInt(hours)
  ]

  notification("⌛ Waiting for payment approval...")
  try {
    await approve(posts[hireIn].price.multipliedBy(hours))
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`⌛ Awaiting payment for "${posts[hireIn].title}"...`)
  try {
    const result = await contract.methods
      .hireTutor(...params)
      .send({ from: kit.defaultAccount })
    notification(`🎉 You successfully bought "${posts[hireIn].title}".`)
    getData()
    getBalance()
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
})

document.querySelector("#viewHires").addEventListener("click", async (e) => {
  document.getElementById("viewHires").style.display = "none"
  document.getElementById("viewAll").style.display = "initial"

  const _hires = await contract.methods.getHireIndex(kit.defaultAccount).call()
  hires = []
  for (let i of _hires){
    const hire = await contract.methods.getHireInfo(i).call()
    hires.push(hire)
  }
  renderHires()
})

document.querySelector("#viewAll").addEventListener("click", async (e) => {
  document.getElementById("viewHires").style.display = "initial"
  document.getElementById("viewAll").style.display = "none"

  getData()
  
})

function renderHires() {
  document.getElementById("marketplace").innerHTML = ""
  for(let j of hires){
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = hiresTemplate(posts[j[0]], j[1])
    document.getElementById("marketplace").appendChild(newDiv)
  }
}

function hiresTemplate(_hirePost, h) {
  return `
    <div class="card mb-4">
      <div class="card-body text-left p-4 position-relative">
        <h2 class="card-title fs-4 fw-bold mt-2">${_hirePost.title}</h2>
        <p class="text-muted">
          ${subjects[_hirePost.subject]}             
        </p>
        <p class="card-text">
          ${h} Hours      
        </p>
      </div>
    </div>
  `
}