import axios from 'axios';
import React, { useState,useEffect,useRef } from 'react';
import { useNavigate,useParams } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { NotFoundPage } from "..";
import { ClassSelect,AddExtraPeriodForm } from ".";
import { setAllUsers } from "../../store/userSlice";
import { 
    Box,
    Grid,
    Container,
    Typography,
    TextField,
    List,
    ListItem,
    ListItemIcon,
    Button,
    ListItemText,
    InputLabel,
    Select,
    FormControl,
    MenuItem,
    FormGroup,
    FormLabel,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import {
    singleTeacherMainContainer
} from "./style";

const formStyle = {
    display:'flex',
    flexDirection:'column',
    gap:'10px'
};

const SingleTeacherPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { allClasses } = useSelector((state) => state.class);
    const [token, setToken] = useState(window.localStorage.getItem("token"));
    // variables for teacher personal information
    const [firstName,setFirstName] = useState('');
    const [lastName,setLastName] = useState('');
    const [phoneNumber,setPhoneNumber] = useState('');
    const [classes,setClasses] = useState([]);
    const [teacherInfoUpdated,setTeacherInfoUpdated] = useState(false);
    // variable for adding a new class
    const [classId,setClassId] = useState('');
    const [newClassInfoUpdated,setNewClassInfoUpdated] = useState(false);
    // variables for adding a new lunch or team meeting
    const [className,setClassName] = useState('');
    const [school,setSchool] = useState('');
    const [period,setPeriod] = useState('');
    const [letterDays,setLetterDays] = useState([]);
    const [newExtraPeriodInfoUpdated,setExtraPeriodInfoUpdated] = useState(false);
    // variables for user feedback
    const [loading,setLoading] = useState(false);
    const [userUpdatedMessage,setUserUpdatedMessage] = useState(false);
    const [confirmDeleteMessage,setConfirmDeleteMessage] = useState(false);
        
    // fetching user information
    const fetchUser = async() =>{
        setLoading(true);
        const foundUser = await axios.get(`/api/users/${id}`);
        setFirstName(foundUser.data.firstName);
        setLastName(foundUser.data.lastName);
        setPhoneNumber(foundUser.data.phoneNumber);
        setClasses(foundUser.data.classes);
        setLoading(false);
    };
    useEffect(() => {
        fetchUser();
    }, []);

    // functions for updating teacher personal information
    const handleFirstNameChange = (event) =>{
        setFirstName(event.target.value);
        setTeacherInfoUpdated(true);
    };
    const handleLastNameChange = (event) =>{
        setLastName(event.target.value);
        setTeacherInfoUpdated(true);
    };
    const handlePhoneNumberChange = (event) =>{
        setPhoneNumber(event.target.value);
        setTeacherInfoUpdated(true);
    };
    
    // functions for updating a new class
    const handleClassChange = (event) =>{
        setClassId(event.target.value);
        setNewClassInfoUpdated(true);
    };

    // functions for updating teacher schedule information
    const handleClassNameChange = (event) =>{
        setClassName(event.target.value);
        setExtraPeriodInfoUpdated(true);
    };
    const handleSchoolChange = (event) =>{
        setSchool(event.target.value);
        setExtraPeriodInfoUpdated(true);
    };
    const handlePeriodChange = (event) =>{
        setPeriod(event.target.value);
    };
    const handleLetterDaysChange =(event)=>{
        if(letterDays.includes(event.target.value)){
            setLetterDays(letterDays.filter(day=>day!==event.target.value))
        }else{
            setLetterDays([...letterDays,event.target.value]);
        };
    };

    // function for updating in backend
    const updateTeacher = async(event) =>{
        //event.preventDefault();
        let teacherInfo;
        let newClassInfo;
        let newExtraPeriodInfo;
        teacherInfoUpdated ? teacherInfo={firstName,lastName,phoneNumber} : teacherInfo=null;
        newClassInfoUpdated ? newClassInfo={classId} : newClassInfo=null;
        newExtraPeriodInfoUpdated ? newExtraPeriodInfo={className,school,period,letterDays} : newExtraPeriodInfo=null;
        try{
            const body = {
                teacherInfo,
                newClassInfo,
                newExtraPeriodInfo
            };
            await axios.put(`/api/users/${id}`,body);
            const updatedUser = await axios.get(`/api/users/${id}`);
            setFirstName(updatedUser.data.firstName);
            setLastName(updatedUser.data.lastName);
            setPhoneNumber(updatedUser.data.phoneNumber);
            setClasses(updatedUser.data.classes);
            const updatedUsers = await axios.get('/api/users');
            dispatch(setAllUsers(updatedUsers.data));
            setUserUpdatedMessage(true);
        }catch(error){
            console.log(error);
            setUserUpdatedMessage(false);
        };
    };

    // functions for deleting a teacher instance
    const confirmDelete = () =>{
        confirmDeleteMessage ? setConfirmDeleteMessage(false) : setConfirmDeleteMessage(true);
    };
    const deleteTeacher = async()=> {
        await axios.delete(`/api/users/${id}`);
        const updatedUsers = await axios.get('/api/users');
        dispatch(setAllUsers(updatedUsers.data));
        navigate('/teachers');
    };

    if(!token) return <NotFoundPage/>
    if(loading) return <p>Loading...</p>
    return (
        <Box sx={singleTeacherMainContainer}>
            <form onSubmit={updateTeacher} style={formStyle}>
                <Box>
                    <Box>
                        <Typography variant="h3" sx={{fontFamily:"Montserrat",marginBottom:'0px'}}>{firstName} {lastName}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{fontFamily:"Montserrat",marginBottom:'0px'}}>Schedule</Typography>
                        <List>
                            {classes.map((eachClass) => {
                                return (
                                    <ListItem key={eachClass.id}>
                                        <ListItemIcon>
                                            <SchoolIcon />
                                        </ListItemIcon>
                                        <ListItemText sx={{fontFamily:"Montserrat"}} primary={`${eachClass.name} - ${eachClass.period} - ${eachClass.letterDays}`}/>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </Box>
                <Box>
                    <TextField id="outlined-basic" label="First name" variant="outlined" value={firstName} onChange={handleFirstNameChange}/>
                    <TextField id="outlined-basic" label="Last name" variant="outlined" value={lastName} onChange={handleLastNameChange}/>
                    {/* <TextField id="outlined-basic" label="Phone number" variant="outlined" value={phoneNumber} onChange={handlePhoneNumberChange}/> */}
                </Box>
                <Box>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Add a class</InputLabel>
                        <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Class"
                                onChange={handleClassChange}
                        >
                            {allClasses.map((eachClass) => {
                                return (
                                    eachClass.name!=='Team meeting' && 
                                    <MenuItem key={eachClass.id} value={eachClass.id}>
                                        {eachClass.name} {eachClass.letterDays}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <FormControl fullWidth>
                        <InputLabel id="lunch/team meeting select label">Add a lunch/team meeting</InputLabel>
                        <Select
                            labelId="lunch/team meeting select label"
                            id="lunch/team meeting select"
                            label="Class name"
                            onChange={handleClassNameChange}
                        >
                            <MenuItem value='Lunch'>Lunch</MenuItem>
                            <MenuItem value='Team meeting'>Team meeting</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <FormControl fullWidth>
                        <InputLabel id="school select label">School</InputLabel>
                        <Select
                            labelId="school select label"
                            id="school select"
                            label="School"
                            onChange={handleSchoolChange}
                        >
                            <MenuItem value='MS'>MS</MenuItem>
                            <MenuItem value='HS'>HS</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <FormControl fullWidth>
                        <InputLabel id="period select label">Period</InputLabel>
                        <Select
                            labelId="period select label"
                            id="period select"
                            label="Period"
                            onChange={handlePeriodChange}
                        >
                            <MenuItem value='1'>1</MenuItem>
                            <MenuItem value='2'>2</MenuItem>
                            <MenuItem value='3'>3</MenuItem>
                            <MenuItem value='4'>4</MenuItem>
                            <MenuItem value='5'>5</MenuItem>
                            <MenuItem value='6'>6</MenuItem>
                            <MenuItem value='7'>7</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <FormControl>
                        <FormLabel>Letter Days</FormLabel>
                        <Box>
                            <FormControlLabel control={<Checkbox value="A" onChange={handleLetterDaysChange}/>} label="A" />
                            <FormControlLabel control={<Checkbox value="B" onChange={handleLetterDaysChange}/>} label="B" />
                            <FormControlLabel control={<Checkbox value="C" onChange={handleLetterDaysChange}/>} label="C" />
                            <FormControlLabel control={<Checkbox value="D" onChange={handleLetterDaysChange}/>} label="D" />
                            <FormControlLabel control={<Checkbox value="E" onChange={handleLetterDaysChange}/>} label="E" />
                            <FormControlLabel control={<Checkbox value="F" onChange={handleLetterDaysChange}/>} label="F" />
                        </Box>
                    </FormControl>
                </Box>
                <Button type='submit' style={{width:'56px'}}>Update</Button>
                {/* <Grid container spacing={2}>
                    <Grid item xs={8}>
                        <Item>xs=8</Item>
                    </Grid>
                    <Grid item xs={4}>
                        <Item>xs=4</Item>
                    </Grid>
                    <Grid item xs={4}>
                        <Item>xs=4</Item>
                    </Grid>
                    <Grid item xs={8}>
                        <Item>xs=8</Item>
                    </Grid>
                </Grid> */}
            </form>
            {userUpdatedMessage && <p style={{ color: "green", marginTop: "10px" }}>Teacher successfully updated.</p>}
            {!confirmDeleteMessage && <button onClick={() => confirmDelete()}>Delete</button>}
            {confirmDeleteMessage && <p style={{color:'red'}}>Are you sure you want to delete this teacher?</p>}
            {confirmDeleteMessage && <button onClick={() => confirmDelete()}>Cancel</button>}
            {confirmDeleteMessage && <button onClick={() => deleteTeacher()}>Delete</button>}
        </Box>
    );
};

export default SingleTeacherPage;