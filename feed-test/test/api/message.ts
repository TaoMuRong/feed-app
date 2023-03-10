import Axios from "./request";
import {ApiResp, IMessage, IMsgInList} from "../libs/types";


export async function listUsersInMessage(token:string) {
    const {data} = await Axios.get<ApiResp<IMsgInList[]>>("/message/getUsers",{
        headers: {
          Cookie: `token=${token}`,
        },
    })
    return data
}


export async function getChatMessageList(friendId: string, token:string) {
    const {data} = await Axios.get<ApiResp<IMessage[]>>(`/message/getFriendsMessageList?friendId=${friendId}`,{
        headers: {
          Cookie: `token=${token}`,
        },
    })
    return data
}