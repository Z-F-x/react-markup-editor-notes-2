 import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid"
import {
    onSnapshot,
    addDoc,
    doc,
    deleteDoc,
    setDoc
} from "firebase/firestore"
import { notesCollection, db } from "./firebase"
export default function App() {
    const [notes, setNotes] = React.useState([])

    const [currentNoteId, setCurrentNoteId] = React.useState("")
    const [tempNoteText, setTempNoteText] = React.useState("")



    const currentNote =
        notes.find(note => note.id === currentNoteId)
        || notes[0]
// For some reason så måtte det en if() til for at nettleseren klart å lese `.body`
        React.useEffect(() => {
            if (currentNote) {
                setTempNoteText(currentNote.body)
            }
        }, [currentNote])





    var sortBy = []
    let sortetNotes = []
     sortetNotes = notes.map(function(note){
        sortBy.push(note)
        sortBy.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          });

     })


    React.useEffect(()=>{
        const timeoutId = setTimeout(()=>{
            if(tempNoteText !== currentNote.body){
                updateNote(tempNoteText)
            }
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [tempNoteText])


    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
            // Sync up our local notes array with the snapshot data
            const notesArr = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }))
            setNotes(notesArr)
        })
        return unsubscribe
    }, [])

|   React.useEffect(() =>{
    if(!currentNoteId){
        setCurrentNoteId(notes[0]?.id)
    }
}, [notes])

    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        const newNoteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteRef.id)
    }

    async function updateNote(text) {
        console.log(currentNote.id)
        const docRef = doc(db, "notes", currentNote.id)
        await setDoc(docRef, { body: text, updatedAt: Date.now() }, { merge: true })
        console.log(currentNote)
    }

    async function deleteNote(event, notesId) { 
        // let notesId = notes.id
        console.log(notesId)
        const docRef = doc(db, "notes", notesId)
        await deleteDoc(docRef)
        
    }

    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={sortBy}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        {
           
                            <Editor
                               tempNoteText={tempNoteText}
                            setTempNoteText={setTempNoteText}
                            />
                        }
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    )
}
