import React from "react";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const myId = uuidv4();
const socket = io(process.env.REACT_APP_API_URL);
socket.on("connect", () => console.log("[IO] Connect => New connection"));


export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [life, setLife] = useState(5);
  const [input, setInput] = useState(false);

  const ENDPOINT = process.env.REACT_APP_API_URL;

  useEffect( () => {
 
    socket.emit('join', (error) => {
        if(error) {
            alert(error);
        }
    })
    return () => {
        socket.off();
    }
     
},[ENDPOINT]);

useEffect( () =>  {
  socket.on('message', (mensagem) => {
      setMessages([...messages, mensagem]);
  })
},[messages])

  useEffect(() => {
    const handleLife = (idDmg) => {
      if (idDmg.id !== myId) {
        if (life > 0) {
          setLife(life - 1);
        }        
      } 
    };
    socket.on("lifeUpdate", handleLife);
  }, [life]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (life === 0){
        setInput(true)
    } else {
    if (message.trim()) {
      socket.emit("sendMessage", message);
      setMessage("");
    }
    }    
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleLifeUpdate = (e) => {
    e.preventDefault();
    if (life === 0){
        setInput(true)
    } else {
    socket.emit("lifeUpdate", {
      id: myId,
    });
    }      
  };

  const clear = (e) => {
    e.preventDefault();
    if (life === 0){
        setInput(true)
    } else {
        setMessages([]);
    }
    
  };

  return (
    <main className="chat-container">
      <div className="chat-app">
        <span className="life">Life: {life}</span>
        <div className={`chat-real`}>
          {messages.map((m, index) => (
            <p className={`message ${m.id === myId ? 'mine' : 'other'} `}
            key={index}>
              {m.user.slice(0,6)} diz: {m.message}
            </p>
          ))}
        </div>

        <form className="form" onSubmit={handleFormSubmit}>
          <input
            readOnly={input}
            type="text"
            placeholder="Escreva uma mensagem"
            className="text-input"
            onChange={handleInputChange}
            value={message}
          />
          <button className="btn" disabled={input} type="submit">Send</button>
          <button className="btn" disabled={input} onClick={handleLifeUpdate}>Dano</button>
          <button className="btn" disabled={input} onClick={clear}>Limpar</button>
        </form>
      </div>
    </main>
  );
}
