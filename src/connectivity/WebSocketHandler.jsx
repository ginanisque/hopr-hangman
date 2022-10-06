import React, { useEffect, useState } from 'react'
import useWebsocket from './useWebSocket'
import { decode } from 'rlp'

export const WebSocketHandler = ({ wsEndpoint, securityToken, game }) => {
  const [message, setMessage] = useState('')
  const websocket = useWebsocket({ wsEndpoint, securityToken })
  const { socketRef } = websocket
  const handleReceivedMessage = async (ev) => {
    try {
      let wsMsg;

      let uint8Array = new Uint8Array(JSON.parse(`[${ev.data}]`));
      let decodedArray = decode(uint8Array)
      if (decodedArray[0] instanceof Uint8Array) {
        wsMsg = new TextDecoder().decode(decodedArray[0])
      }

      const data = JSON.parse(wsMsg)

      setMessage(data)
      game.multiplayer.parseMessage(data);

    } catch (err) {
      console.error("Couldn't parse websocket message\n", err)
    }
  }
  useEffect(() => {
    if (!socketRef.current) return
    socketRef.current.addEventListener('message', handleReceivedMessage)

    return () => {
      if (!socketRef.current) return
      socketRef.current.removeEventListener('message', handleReceivedMessage)
    }
  }, [socketRef.current])

  // return message || false;
  return false;
  // return <span>{message ? message : 'You have no messages.'}</span>
}

export default WebSocketHandler
