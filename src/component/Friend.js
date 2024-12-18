import React, { useEffect, useState } from 'react'
import { FcSearch} from 'react-icons/fc';
import { getDatabase, ref, onValue,set,push, remove} from "firebase/database";
import { useDispatch, useSelector} from 'react-redux';
import { activeChat } from '../slices/userInfo/activeChatSlice';

const Friend = ({active}) => {
    let data = useSelector((state)=>state.userLoginInfo.userInfo)
    let forwordItem = useSelector((state)=>state.forwordItem.forwordItem)
    const db = getDatabase();
    const dispatch = useDispatch();
    let [accept, setAccept] = useState([])
    let [delateBox, setDelateBox] = useState(false);
    let [dltGroup, setDltGroup] = useState([]);
    let [filterUser, setFilterUser] = useState([])
    useEffect(()=>{
        const acceptfrndRef = ref(db, 'friend');
        onValue(acceptfrndRef, (snapshot) => {
           let arr = [];
            snapshot.forEach((item)=>{
                if(data.uid == item.val().receiverId || data.uid == item.val().senderId){
                    arr.push({...item.val() , userid: item.key}); 
                }
            });
            setAccept(arr);
        });
    },[])
    let handelBlock = (item)=>{
      setDelateBox(false)
      if(data.uid == item.senderId){
        set(push(ref(db, 'blocklist')),{
          block: item.receiverName,
          blockid: item.receiverId,
          blockemail: item.receiveremail,
          blockprofile: item.receiverprofile,
          blockby: item.senderName,
          blockbyid: item.senderId,
          blockbyemail: item.senderemail,
          blockbyprofile: item.senderprofile,
          }).then(()=>{
            remove(ref(db, 'friend/'+item.userid))
          });
        }else if(data.uid == item.receiverId){
        set(push(ref(db, 'blocklist')),{
          block: item.senderName,
          blockid: item.senderId,
          blockemail: item.senderemail,
          blockprofile: item.senderprofile,
          blockby: item.receiverName,
          blockbyid: item.receiverId,
          blockbyemail: item.receiveremail,
          blockbyprofile: item.receiverprofile,
          }).then(()=>{
            setDelateBox(false)
            remove(ref(db, 'friend/'+item.userid))
          });  
      }
    }
    let handelDelateBox = (item)=>{
      setDelateBox(true)
      
      if(data.uid == item.senderId){
        let blockid = item.receiverId;
        let blockbyid = item.senderId;
        setDltGroup(blockid + blockbyid)
        }else if(data.uid == item.receiverId){
        let blockid = item.senderId;
        let blockbyid = item.receiverId;
          setDltGroup(blockid + blockbyid)
        }
    }  
    let handelSearch =(e)=>{
      let arr = [];
      if(e.target.value.length == 0){
        setFilterUser([])
      }else{
        accept.filter((item)=>{           
            if(item.senderName.toLowerCase().includes(e.target.value.toLowerCase()) || item.receiverName.toLowerCase().includes(e.target.value.toLowerCase())){
                arr.push(item)
            }
            setFilterUser(arr)
          })
    }         
    };
    let handelSingleChat = (item)=>{
      if(data.uid == item.senderId){
        dispatch(activeChat({status: "singlemsg", name: item.receiverName, email: item.receiveremail, id: item.receiverId, profile: item.receiverprofile,}))
        localStorage.setItem("activeSingle", JSON.stringify({status: "singlemsg", name: item.receiverName, email: item.receiveremail, id: item.receiverId, profile: item.receiverprofile,}))
      }else{
        dispatch(activeChat({status: "singlemsg", name: item.senderName, email: item.senderemail, id: item.senderId, profile: item.senderprofile,}))
        localStorage.setItem("activeSingle", JSON.stringify({status: "singlemsg", name: item.senderName, email: item.senderemail, id: item.senderId, profile: item.senderprofile,}))
      }
    }
    let handelSendMsg =(item)=>{
        if(data.uid == item.receiverId){
          set(push(ref(db, 'singleChat')),{
            sendid: data.uid,
            sendname: data.displayName,
            msg: forwordItem.msg,
            img: forwordItem.img ? forwordItem.img:'',
            audio: forwordItem.audio,
            receivid: item.senderId,
            receivname: item.senderName,
            date: `${new Date().getDate()}-${new Date().getMonth()+1}-${new Date().getFullYear()}`,
            forword: "Forword message"
           });
        }else{
          set(push(ref(db, 'singleChat')),{
            sendid: data.uid,
            sendname: data.displayName,
            msg: forwordItem.msg,
            img: forwordItem.img ? forwordItem.img:'',
            audio: forwordItem.audio,
            receivid: item.receiverId,
            receivname: item.receiverName,
            date: `${new Date().getDate()}-${new Date().getMonth()+1}-${new Date().getFullYear()}`,
            forword: "Forword message"
           });
        }
            
      }
  return (
    <div className='pt-5 pb-5 pl-5 rounded-lg relative bg-white shadow-md z-30'>
        <div className='flex justify-between pr-8 items-center'>
          {
           active == "chatpage"
           ?<h2 className='text-sm font-poppins font-semibold text-black'>Let's talk with friends</h2>
           :<h2 className='text-sm font-poppins font-semibold text-black'>Friend List</h2>
          }
            <div className='flex items-center shadow-md px-2'>
                <input type="text" placeholder="Search" className='outline-none rounded-lg text-shadow font-semibold text-lg'
                onChange={handelSearch} />
                <FcSearch className='text-2xl cursor-pointer text-secondar'/>
            </div>
        </div>
           <div className='h-[650px] overflow-y-scroll pr-6'>
            {
              accept.length == 0
              ? <p className='h-full flex items-center justify-center font-medium font-poppins text-2xl text-shadow'>Add users in your friend list </p>
              : filterUser.length >0
              ? filterUser.map(item=>(
                item.senderId == data.uid 
                ?
                <div>
                  {
                    delateBox && dltGroup.includes(item.receiverId + item.senderId)
                    ?<div className='text-center'>
                    <p className='font-nunito font-semibold text-lg text-primary p-6'>Are you sure you want to block your Friend <span className='text-secondary'>{item.receiverName}</span> ?</p>
                    <button onClick={()=>handelBlock(item)} className='inline-block py-2 px-5 mr-3 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>Yes</button>
                    <button onClick={()=>setDelateBox(!delateBox)} className='inline-block py-2 px-5 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>No</button>
                  </div>
                  : active == "chatpage"
                  ? <div onClick={()=>handelSingleChat(item)} className='flex py-4 border-b-2 items-center cursor-pointer'>
                  <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                    <img className='w-full h-full' src={item.receiverprofile}/>
                  </div>
                  <div>
                      <h2 className='font-semibold font-poppins text-sm mt-2'>{item.receiverName}</h2>
                      <p className='font-medium font-poppins text-xs text-shadow'>{item.receiveremail}</p>
                  </div>
                  <div className='mt-2 ml-auto'>
                    <p className='font-poppins font-medium text-xs text-shadow'>Today,fgasdf 8:56pm</p>
                  </div>
                </div>
                 
                  : <div className='flex py-4 border-b-2'>
                  <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                    <img className='w-full h-full' src={item.receiverprofile}/>
                  </div>
                  <div>
                      <h2 className='font-semibold font-poppins text-sm mt-2'>{item.receiverName}</h2>
                      <p className='font-medium font-poppins text-xs text-shadow'>{item.receiveremail}</p>
                  </div>
                  <div className='mt-2 ml-auto'>
                  <button className='inline-block py-2 px-2 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'
                 onClick={()=>handelDelateBox(item)}>
                  Block
                 </button>
                  <button className='inline-block py-2 px-2 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>
                  Unfriend
                 </button>
                  </div>
                </div>
                  }
                </div>
                : <div>
                  { delateBox && dltGroup.includes(item.senderId + item.receiverId)
                    ?<div className='text-center'>
                    <p className='font-nunito font-semibold text-lg text-primary p-6'>Are you sure you want to block your Friend <span className='text-secondary'>{item.senderName}</span> ?</p>
                    <button onClick={()=>handelBlock(item)} className='inline-block py-2 px-5 mr-3 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>Yes</button>
                    <button onClick={()=>setDelateBox(!delateBox)} className='inline-block py-2 px-5 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>No</button>
                  </div>
                  :active == "chatpage"
                  ?<div onClick={()=>handelSingleChat(item)} className='flex py-4 border-b-2 items-center cursor-pointer'>
                  <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                    <img className='w-full h-full' src={item.senderprofile}/>
                  </div>
                  <div>
                      <h2 className='font-semibold font-poppins text-sm mt-2'>{item.senderName}</h2>
                      <p className='font-medium font-poppins text-xs text-shadow'>{item.senderemail}</p>
                  </div>
                      <div className='mt-2 ml-auto'>
                        <p className='font-poppins font-medium text-xs text-shadow'>Today,fgsdf 8:56pm</p>
                      </div>
                  </div>
                  :
                  <div className='flex py-4 border-b-2'>
                  <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                    <img className='w-full h-full' src={item.senderprofile}/>
                  </div>
                  <div>
                      <h2 className='font-semibold font-poppins text-sm mt-2'>{item.senderName}</h2>
                      <p className='font-medium font-poppins text-xs text-shadow'>{item.senderemail}</p>
                  </div>
                      <div className='mt-2 ml-auto flex gap-2'>
                      <button className='inline-block py-2 px-2 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'
                       onClick={()=>handelDelateBox(item)} >
                        Block
                      </button>
                      <button className='inline-block py-2 px-2 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>
                        Unfriend
                      </button>
                    </div>
                  </div>
                  }
            </div>
                ))
                // ============== Search part end ==========================
              :
              accept.map(item=>(
                    item.senderId == data.uid 
                    ?
                    <div>
                      {
                        delateBox && dltGroup.includes(item.receiverId + item.senderId)
                        ?<div className='text-center'>
                        <p className='font-nunito font-semibold text-lg text-primary p-6'>Are you sure you want to block your Friend <span className='text-secondary'>{item.receiverName}</span> ?</p>
                        <button onClick={()=>handelBlock(item)} className='inline-block py-2 px-5 mr-3 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>Yes</button>
                        <button onClick={()=>setDelateBox(!delateBox)} className='inline-block py-2 px-5 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>No</button>
                      </div>
                      : active == "chatpage"
                      ?<div onClick={()=>handelSingleChat(item)} className='flex py-4 border-b-2 items-center cursor-pointer'>
                      <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                        <img className='w-full h-full' src={item.receiverprofile}/>
                      </div>
                      <div>
                          <h2 className='font-semibold font-poppins text-sm mt-2'>{item.receiverName}</h2>
                          <p className='font-medium font-poppins text-xs text-shadow'>{item.receiveremail}</p>
                      </div>
                      <div className='mt-2 ml-auto'>
                        <p className='font-poppins font-medium text-xs text-shadow'>Today, 8:56pm</p>
                      </div>
                    </div>
                      :
                      active == "forword"
                      ?<div onClick={()=>handelSendMsg(item)} className='flex py-4 border-b-2 items-center cursor-pointer'>
                      <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                        <img className='w-full h-full' src={item.receiverprofile}/>
                      </div>
                      <div>
                          <h2 className='font-semibold font-poppins text-sm mt-2'>{item.receiverName}</h2>
                          <p className='font-medium font-poppins text-xs text-shadow'>{item.receiveremail}</p>
                      </div>
                      <div className='mt-2 ml-auto'>
                        <p className='font-poppins font-medium text-xs text-shadow'>Today</p>
                      </div>
                    </div>
                      :
                       <div className='flex py-4 border-b-2'>
                      <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                        <img className='w-full h-full' src={item.receiverprofile}/>
                      </div>
                      <div>
                          <h2 className='font-semibold font-poppins text-sm mt-2'>{item.receiverName}</h2>
                          <p className='font-medium font-poppins text-xs text-shadow'>{item.receiveremail}</p>
                      </div>
                      <div className='mt-2 ml-auto flex gap-2'>
                      <button className='inline-block py-2 px-2 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'
                      onClick={()=>handelDelateBox(item)}>
                      Block
                     </button>
                      <button className='inline-block py-2 px-2 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>
                      Unfriend
                     </button>
                      </div>
                    </div>
                      }
                    </div>
                    : <div>
                      { delateBox && dltGroup.includes(item.senderId + item.receiverId)
                        ?<div className='text-center'>
                          <div>
                        <p className='font-nunito font-semibold text-md text-primary p-6'>Are you sure you want to block your Friend <span className='text-secondary'>{item.senderName}</span> ?</p>
                        <button onClick={()=>handelBlock(item)} className='inline-block py-2 px-5 mr-3 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>Yes</button>
                        <button onClick={()=>setDelateBox(!delateBox)} className='inline-block py-2 px-5 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'>No</button>
                        </div>
                      </div>
                      :active == "chatpage"
                      ?<div onClick={()=>handelSingleChat(item)} className='flex py-4 border-b-2 items-center cursor-pointer'>
                      <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                        <img className='w-full h-full' src={item.senderprofile}/>
                      </div>
                      <div>
                          <h2 className='font-semibold font-poppins text-sm mt-2'>{item.senderName}</h2>
                          <p className='font-medium font-poppins text-xs text-shadow'>{item.senderemail}</p>
                      </div>
                            
                      <div className='mt-2 ml-auto'>
                        <p className='font-poppins font-medium text-xs text-shadow'>Today, 8:56pm</p>
                      </div>
                  </div>
                      :
                      active == "forword"
                      ?<div onClick={()=>handelSendMsg(item)} className='flex py-4 border-b-2 items-center cursor-pointer'>
                      <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                        <img className='w-full h-full' src={item.senderprofile}/>
                      </div>
                      <div>
                          <h2 className='font-semibold font-poppins text-sm mt-2'>{item.senderName}</h2>
                          <p className='font-medium font-poppins text-xs text-shadow'>{item.senderemail}</p>
                      </div>
                            
                      <div className='mt-2 ml-auto'>
                        <p className='font-poppins font-medium text-xs text-shadow'>Today,</p>
                      </div>
                  </div>
                      :
                      <div className='flex py-4 border-b-2'>
                          <div className='mr-4 w-[52px] h-[54px] rounded-full overflow-hidden'>
                            <img className='w-full h-full' src={item.senderprofile}/>
                          </div>
                          <div>
                              <h2 className='font-semibold font-poppins text-sm mt-2'>{item.senderName}</h2>
                              <p className='font-medium font-poppins text-xs text-shadow'>{item.senderemail}</p>
                          </div>
                                
                          <div className='mt-2 ml-auto flex gap-2'>
                          <button className='inline-block py-2 px-2 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'
                           onClick={()=>handelDelateBox(item)} >
                            Block
                          </button>
                          <button className='inline-block py-2 px-2 bg-secondary font-semibold font-poppins text-sm text-white rounded-lg'
                            >
                            Unfriend
                          </button>
                        </div>
                      </div>
                      }
                </div>
                    ))
            }
             </div>
    </div>
  )
}

export default Friend
