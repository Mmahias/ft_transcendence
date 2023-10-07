import { Socket } from 'socket.io-client';
import { Channel } from '../api/types';

/**
 * 
 * @param socket server socket
 * @param event  for example 'chat' 'game'
 * @param payload for example 'player move', 'sent message', etc
 */
export function sendNotificationToServer(socket: Socket | null, event: string, payload: string) {
  if (socket) {
    socket.emit(event, payload);
  }
};

/**
 * @abstract Special handling for MUTE/KICK/BAN/ADMIN requests
 * @param socket connexion du client avec notre serveur
 * @param payload <Action <Concerned user's nickname>. Ex: '/mute  Joe'
 */
export function handleRequestFromUser(socket: Socket | null, group: string, action: string, channelName: string, userTalking: string) {
  var role: string;
  var info: string;
  switch (group) {
    case "bannedUsers":
      role = "/ban";
      info = (action === "connect") ?
        `#INFO# ${userTalking} has been banned from this channel.`
        : `#INFO# ${userTalking} is unbanned from this channel.`
      break;
    case "kickedUsers":
      role = "/kick";
      info = (action === "connect") ?
        `#INFO# ${userTalking} has been kicked from this channel.`
        : `#INFO# ${userTalking} is not kicked anymore from this channel.`
      break;
    case "mutedUsers":
      role = "/mute";
      info = (action === "connect") ?
        `#INFO# ${userTalking} has been muted from this channel.`
        : `#INFO# ${userTalking} is not muted anymore in this channel.`
      break;
    case "admin":
      role = "/admin";
      info = (action === "connect") ?
        `#INFO# ${userTalking} was made Admin of this channel.`
        : `#INFO# ${userTalking} is not an Admin anymore.`
      break;
    default:
      role = "/msg";
      info = `#INFO# ${userTalking} is quoted in this channel.`
  }
  const payload: string = role + "  " + channelName + "  " + userTalking;

  sendNotificationToServer(socket, 'Chat', payload);
  return (info);
}

export function sendInviteToUser(socket: Socket, dmName: string, userInvited: string, channelToJoin: Channel) {
  const payload: string = "/invite  " + dmName + "  " + userInvited + " " + channelToJoin.name
  const info: string = `#INFO# ${userInvited} has been invited to the channel ${channelToJoin.name} ${channelToJoin.id}.`;

  sendNotificationToServer(socket, 'Chat', payload);
  return (info);
}