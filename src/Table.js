import React, {useEffect, useState} from 'react';
import "./Table.css";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import {Button, DialogContent, TextField} from "@mui/material";

function Table() {
    const [name, setName] = useState("")
    const [birthday, setBirthday] = useState("")
    const [gender, setGender] = useState("")

    const [openNewDialog, handleNewDisplay] = React.useState(false);
    const handleNewClose = () => {
        handleNewDisplay(false);
    };
    const openNewDialogBox = () => {
        handleNewDisplay(true);
    };

    const [errorMsg, setErrorMsg] = React.useState("")
    const [openErrorDialog, handleErrorDisplay] = React.useState(false);
    const handleErrorClose = () => {
        handleErrorDisplay(false);
    };
    const openErrorDialogBox = (msg) => {
        setErrorMsg(msg)
        handleErrorDisplay(true);
    };

    const [patients, setPatients] = useState([]);

    let fetchPatients = () => {
        fetch("http://localhost:8080/patients")
            .then(request => request.json())
            .then((data) => {
                setPatients(data);
            }).catch(error =>{
            openErrorDialogBox(error)
        })
    }

    useEffect(() => {
        fetchPatients()
        const interval = setInterval(fetchPatients, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="contentWrapper">
        <table className="table">
            <tr>
                <th>ФИО</th>
                <th>Дата рождения</th>
                <th>Пол</th>
                <th></th>
                <th></th>
            </tr>
            <tbody>
            {
                patients.map(patient => <Row patient={patient} errorCallback={openErrorDialog}/>)
            }

            <tr>
                <td onClick={()=>{
                    openNewDialogBox()
                }} colSpan={5} ><Button sx={{width:1,borderRadius: 0}} onClick={openNewDialogBox} variant="standard">New</Button></td>
            </tr>
            </tbody>
        </table>

            <Dialog onClose = {handleNewClose} open = {openNewDialog}>
                <DialogTitle> New </DialogTitle>
                <DialogContent>
                    <TextField
                        sx={{ m: 2,width: 3/4}}
                        value={name}
                        label="Name"
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />

                    <TextField
                        sx={{ m: 2 }}
                        value={birthday}
                        label="Birthday"
                        onChange={(e) => {
                            setBirthday(e.target.value);
                        }}
                    />

                    <TextField
                        sx={{ m: 2 }}
                        value={gender}
                        label="Gender"
                        onChange={(e) => {
                            setGender(e.target.value);
                        }}
                    />


                </DialogContent>
                <Button onClick={() => {
                    let p = {
                        FullName: name,
                        Birthday: birthday,
                        Gender: gender
                    }

                    handleNewClose()

                    let success = true
                    fetch('http://localhost:8080/patient/new',{
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(p)
                    }).then(response => {
                        success = response.ok
                        return response.text()
                    }).then(text => {
                        if (!success) {
                            openErrorDialogBox(text)
                        }
                    }).catch(error =>{
                        openErrorDialogBox(error)
                    })
                }} variant="standard">Ok</Button>
            </Dialog>
            <Dialog onClose = {handleErrorClose} open = {openErrorDialog}>
                <DialogTitle> Error </DialogTitle>
                <DialogContent>
                    {errorMsg}
                </DialogContent>
                <Button onClick={handleErrorClose} variant="standard">Ok</Button>
            </Dialog>
        </div>
    );
}

function Row({ patient, errorCallback }) {
    const [name, setName] = useState(patient.FullName)
    const [birthday, setBirthday] = useState(patient.Birthday)
    const [gender, setGender] = useState(patient.Gender)

    let deletePatient = (guid) => {
        fetch('http://localhost:8080/patient/delete',{
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({GUID: guid})
        }).catch(error =>{
            errorCallback(error)
            })
    }

    const [openDialog, handleDisplay] = React.useState(false);

    const handleClose = () => {
        handleDisplay(false);
    };

    const openDialogBox = () => {
        handleDisplay(true);
    };
    return (
        <tr>
            <td> {name} </td>
            <td> {birthday} </td>
            <td> {gender} </td>
            <td onClick={()=>{openDialogBox()}}> Edit </td>
            <td onClick={() => deletePatient(patient.GUID)}>Delete</td>
            <Dialog onClose = {handleClose} open = {openDialog}>
                <DialogTitle> Edit </DialogTitle>
                <DialogContent>
                    <TextField
                        sx={{ m: 2,width: 3/4}}
                        value={name}
                        label="Name"
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />

                    <TextField
                        sx={{ m: 2 }}
                        value={birthday}
                        label="Birthday"
                        onChange={(e) => {
                            setBirthday(e.target.value);
                        }}
                    />

                    <TextField
                        sx={{ m: 2 }}
                        value={gender}
                        label="Gender"
                        onChange={(e) => {
                            setGender(e.target.value);
                        }}
                    />


                </DialogContent>
                <Button onClick={() => {
                    patient.FullName = name
                    patient.Birthday = birthday
                    patient.Gender = gender

                    fetch('http://localhost:8080/patient/edit',{
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(patient)
                    }).catch(error =>{
                        errorCallback(error)
                    })

                    handleClose()
                }} variant="standard">Ok</Button>
            </Dialog>
        </tr>

    );
}

export default Table;