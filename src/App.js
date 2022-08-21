import logo from './logo.svg';
import './App.css';
import WrongNetworkMessage from './WrongNetworkMessage'
import ConnectWalletButton from './ConnectWalletButton'
import TodoList from './TodoList'
import { TaskContractAddress } from './config.js'
import TaskAbi from './backend/build/TaskContract.json'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react'

import React from "react";


function App() {

  const [correctNetwork, setCorrectNetwork] = useState('false')
  const [isUserLoggedIn, setIsUserLoggedIn] = useState('false')
  const [currentAccount, setCurrentAccount] = useState('')
  const [input, setInput] = useState('')
  const [tasks, setTasks] = useState([])
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    connectWallet()
    getAllTasks()
  }, [])

  const handleClick = event => {
    // 👇️ toggle shown state
    setIsShown(current => !current);

    // 👇️ or simply set it to true
    // setIsShown(true);
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        console.log('Metamask not connected')
        return
      }
      let chainId = await ethereum.request({ method: 'eth_chainId' })
      console.log('Connected to chain:', chainId)

      const rinkebyChainId = '0x4'
      if (chainId !== rinkebyChainId) {
        alert('not connected to the test network')
        setCorrectNetwork(false)
        return
      } else {
        setCorrectNetwork(true)
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('Found accounts:', accounts[0])
      setIsUserLoggedIn(true)
      setCurrentAccount(accounts[0])

    } catch (error) {
      console.log(error)
    }
  }

    // Add tasks from front-end onto the blockchain
    const addTask = async e => {
      e.preventDefault() // avoids refresh
  
      let task = {
        taskText: input,
        isDeleted: false
      }
  
      try {
        const { ethereum } = window
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum)
          const signer = provider.getSigner()
          const TaskContract = new ethers.Contract(
            TaskContractAddress,
            TaskAbi.abi,
            signer
          )
  
          TaskContract.addTask(task.taskText, task.isDeleted)
            .then(res => {
              setTasks([...tasks, task])
              console.log('Added task')
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          console.log('Ethereum object does not exist')
        }
      } catch (error) {
        console.log(error)
      }
      setInput('')
    }
  
    // Remove tasks from front-end by filtering it out on our "back-end" / blockchain smart contract
    const deleteTask = key => async () => {
      try {
        const { ethereum } = window
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum)
          const signer = provider.getSigner()
          const TaskContract = new ethers.Contract(
            TaskContractAddress,
            TaskAbi.abi,
            signer
          )
          const deleteTaskTxn = await TaskContract.deleteTask(key, true)
          console.log('Deleted task: ', deleteTaskTxn)
          
          let allTasks = await TaskContract.getMyTasks()
          setTasks(allTasks)
        } else {
          console.log('eth object does not exist')
        }
      } catch (error) {
        console.log(error)
      }
    }

  // Just gets all the tasks from the contract
  const getAllTasks = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        )
        let allTasks = await TaskContract.getMyTasks()
        setTasks(allTasks)
      } else {
        console.log('eth object does not exist')
      }
    } catch (error) {
      console.log(error)
    }
  }

  function Home() {
    return (
        <h1>This is the homepage</h1>
    );
}
  
  return (
    <div className=''>
    <div>
      <button onClick={handleClick}>About</button>

      {/* 👇️ show elements on click */}
      {isShown && (
        <div>
          <h2>Welcome, the place to store all your vaccine data.</h2>
          <p></p>
          <p>Input vaccine info, date and location to remember them forever.</p>
          <p>Your data is completely stored on the blockchain.</p>
          <p>Why?</p>
          <p>1) ultra-secure encryption and decentralization.</p>
          <p> 2) You OWN the data that you store on the blockchain. 
          There's no corporation that makes you sign privacy policies and secretly  monetizes your data. You have the rights, all of them.</p>
          <h2>Instructions: </h2>
          <p></p>
          <p>- To use this application you need a browser interface to the blockchain. You can easily do this with the Metamask browser extension or mobile app.</p>
          <p>- Head to https://metamask.io/ to download.</p>
          <p>- Set up your blockchain wallet with Metamask</p>
          <p>- In Metamask, select the Ethereum rinkeby test network and make sure your account is connected to this site.</p>
          <p>- Send yourself a small amount of the cryptocurrency Ethereum (each input/deletion costs on average 1 USD and goes directly to the "miners" who calculate the Keccak-256 algorithm to encrypt your data.)</p>
          <p>- Store your vaccine data and come back whenever.</p>
          <p></p>
          <p></p>
          <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '10vh'}}>
              <p> Created by Robert Kottelin </p>
              {/* <p> This is a prototype. </p> */}
          </div>
          <p></p>
        </div>
      )}

      {/* 👇️ show component on click */}
      {isShown && <Box />}
      
    </div>
      {!isUserLoggedIn ? <ConnectWalletButton connectWallet={connectWallet} /> :
        correctNetwork ? <TodoList tasks={tasks} input={input} 
        setInput={setInput} addTask={addTask} 
        deleteTask={deleteTask}/> : <WrongNetworkMessage />}
    </div>
  );
}

function Box() {
  return (
    <div>
      <h2></h2>
    </div>
  );
}

export default App;
