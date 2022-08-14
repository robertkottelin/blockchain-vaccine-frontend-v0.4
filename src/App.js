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
import { Nav, NavLink, NavMenu } 
    from "./NavbarElements";

function App() {

  const [correctNetwork, setCorrectNetwork] = useState('false')
  const [isUserLoggedIn, setIsUserLoggedIn] = useState('false')
  const [currentAccount, setCurrentAccount] = useState('')
  const [input, setInput] = useState('')
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    connectWallet()
    getAllTasks()
  }, [])

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

  const Navbar = () => {
    return (
      <>
        <Nav>
          <NavMenu>
            <NavLink to="/about" activeStyle>
              About
            </NavLink>
          </NavMenu>
        </Nav>
      </>
    );
  };
  
  return (
    <div className=''>
      {!isUserLoggedIn ? <ConnectWalletButton connectWallet={connectWallet} /> :
        correctNetwork ? <TodoList tasks={tasks} input={input} 
        setInput={setInput} addTask={addTask} 
        deleteTask={deleteTask}/> : <WrongNetworkMessage />}
    </div>
  );
}

export default App;
