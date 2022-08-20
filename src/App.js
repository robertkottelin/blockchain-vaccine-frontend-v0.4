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
          <h2>Welcome</h2>
          <p>Input your vaccines here to store the data on the blockchain.</p>
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
