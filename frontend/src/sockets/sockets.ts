import { Socket } from 'socket.io-client';
import { Channel } from '../api/types';


class SocketService {

  /**
   * 
   * @param socket server socket
   * @param event  for example 'chat' 'game'
   * @param payload for example 'player move', 'sent message', etc
   */
  static sendNotificationToServer(socket: Socket | null, event: string, payload: string) {
    if (socket) {
      // console.log("sendNotificationToServer: ", event, payload)
      socket.emit(event, payload);
    }
  };

  /**
   * @abstract Special handling for MUTE/KICK/BAN/ADMIN requests
   * @param socket connexion du client avec notre serveur
   * @param payload <Action <Concerned user's nickname>. Ex: '/mute  Joe'
   */
  static handleRequestFromUser(socket: Socket | null, group: string, action: string, channelId: number, userTalking: string) {
    var role: string;
    var info: string;
    switch (group) {
      case "bannedUsers":
        role = "/ban";
        info = (action === "connect") ?
          `#INFO# ${channelId} ${userTalking} was banned.`
          : `#INFO# ${channelId} ${userTalking} was unbanned.`
        break;
      case "kickedUsers":
        role = "/kick";
        info = (action === "connect") ?
          `#INFO# ${channelId} ${userTalking} was kicked.`
          : `#INFO# ${channelId} ${userTalking} was unkicked.`
        break;
      case "mutedUsers":
        role = "/mute";
        info = (action === "connect") ?
          `#INFO# ${channelId} ${userTalking} was muted.`
          : `#INFO# ${channelId} ${userTalking} was unmuted.`
        break;
      case "adminUsers":
        role = "/admin";
        info = (action === "connect") ?
          `#INFO# ${channelId} ${userTalking} is now admin.`
          : `#INFO# ${channelId} ${userTalking} is not admin anymore.`
        break;
      default:
        role = "/msg";
        info = `#INFO# ${channelId} ${userTalking} is quoted.`
    }
    // console.log("{{{info", info);
    return (info);
  }

  static sendInviteToUser(socket: Socket, dmName: string, userInvited: string, channelToJoin: Channel) {
    const payload: string = "/invite  " + dmName + "  " + userInvited + " " + channelToJoin.name
    const info: string = `#INFO# ${userInvited} was invited to the chan ${channelToJoin.name} ${channelToJoin.id}.`;

    this.sendNotificationToServer(socket, 'Chat', payload);
    return (info);
  }
}


export default SocketService;