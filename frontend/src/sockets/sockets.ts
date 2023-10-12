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
          `#INFO# ${userTalking} was banned.`
          : `#INFO# ${userTalking} was unbanned.`
        break;
      case "kickedUsers":
        role = "/kick";
        info = (action === "connect") ?
          `#INFO# ${userTalking} was kicked.`
          : `#INFO# ${userTalking} was unkicked.`
        break;
      case "mutedUsers":
        role = "/mute";
        info = (action === "connect") ?
          `#INFO# ${userTalking} was muted.`
          : `#INFO# ${userTalking} was unmuted.`
        break;
      case "admin":
        role = "/admin";
        info = (action === "connect") ?
          `#INFO# ${userTalking} is now admin.`
          : `#INFO# ${userTalking} is not an Admin anymore.`
        break;
      default:
        role = "/msg";
        info = `#INFO# ${userTalking} is quoted.`
    }
    const payload: string = role + "***" + channelId + "***" + userTalking;

    this.sendNotificationToServer(socket, 'Chat', payload);
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