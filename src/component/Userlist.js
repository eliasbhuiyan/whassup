import React, { useEffect, useState } from 'react'
import { BiDotsVerticalRounded} from 'react-icons/bi';
import { useDispatch, useSelector} from 'react-redux';
import { getDatabase, ref, onValue, set,push} from "firebase/database";
const Userlist = () => {
    let data = useSelector((state)=>state.userLoginInfo.userInfo)
    let [userList, setUserList] = useState([])
    let [friendreqList, setFriendreqList] = useState([])
    let [friendList, setFriendList] = useState([]) 
    let [block, setBlock] = useState([]) 
    const db = getDatabase();
    useEffect(()=>{
        const userRef = ref(db, 'users/');
        onValue(userRef, (snapshot) => {
           let arr = [];
            snapshot.forEach((item)=>{
                if(data.uid != item.key){
                    arr.push({...item.val(), userid: item.key});          
                }
            });
            setUserList(arr);
        });
    },[])
    let handelFriendreq =(item)=>{
        set(push(ref(db, 'friendreq')), {
            senderName:data.displayName,
            senderId:data.uid,
            senderemail:data.email,
            senderprofile:data.photoURL,
            receiverName: item.username,
            receiverId: item.userid,
            receiveremail: item.email,
            receiverprofile: item.profile_picture,
          });
    }
    useEffect(()=>{
        const friendreqRef = ref(db, 'friendreq');
        onValue(friendreqRef, (snapshot) => {
           let arr = [];
            snapshot.forEach((item)=>{
                    arr.push(item.val().receiverId + item.val().senderId);   
            });
            setFriendreqList(arr);
        });
    },[])
    useEffect(()=>{
        const acceptfrndRef = ref(db, 'friend');
        onValue(acceptfrndRef, (snapshot) => {
            let arr = [];
            snapshot.forEach((item)=>{
                arr.push(item.val().receiverId + item.val().senderId)
            });
            setFriendList(arr);
        });
    },[])
    useEffect(()=>{
        const blocklistRef = ref(db, 'blocklist');
        onValue(blocklistRef, (snapshot) => {
           let arr = [];
            snapshot.forEach((item)=>{
                if(item.val().blockbyid == data.uid){
                    arr.push(data.uid + item.val().blockid)        
                }else{
                    arr.push(data.uid + item.val().blockbyid)   
                }
            });
            setBlock(arr);
        });
    },[])
  return (
    <div className='h-[451px] pt-5 pb-5 pl-5 shadow-md mt-11 rounded-lg relative'>
      <h2 className='text-sm font-poppins font-semibold text-black'>User list</h2>
      <BiDotsVerticalRounded className='absolute top-0 right-7 lef-0 text-2xl cursor-pointer text-secondary'/>
           <div className='h-[370px] overflow-y-scroll pr-6'>
           
            {
                userList.map((item=>(
                <div className='flex py-4 border-b-2'>
                   <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                       <img className='w-full h-full' src={item.profile_picture}/>
                    </div>
                    <div>
                        <h2 className='font-semibold font-poppins text-sm mt-2'>{item.username}</h2>
                        <p className='font-medium font-poppins text-xs text-shadow'>{item.email}</p>
                    </div>
                    <div className='mt-2 ml-auto'>
                    {friendList.includes(data.uid + item.userid) || friendList.includes(item.userid + data.uid)
                       ?<button className='inline-block py-2 px-7 bg-green-800 font-semibold font-poppins text-sm text-white rounded-lg'>
                        Friend
                       </button>                    
                    :friendreqList.includes(item.userid + data.uid) || friendreqList.includes(data.uid + item.userid )?
                       <button className='inline-block py-2 px-4 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>
                        Requested
                       </button>
                       :block.includes(item.userid + data.uid) || block.includes(data.uid + item.userid )?
                       <button className='inline-block py-2 px-2 bg-red-600 font-semibold font-poppins text-sm text-white rounded-lg'>
                        Unavailable
                       </button>
                       :<button className='inline-block py-2 px-2 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'
                       onClick={()=>handelFriendreq(item)}>
                        Add Request
                       </button>
                     }  
                    </div>
                </div>
                )))
            }
               
             </div>
    </div>
  )
}

export default Userlist