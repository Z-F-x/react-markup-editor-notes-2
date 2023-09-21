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


    const currentNote =
        notes.find(note => note.id === currentNoteId)
        || notes[0]


    /**
     * Challenge:
     * 1. ✅ Add createdAt and updatedAt properties to the notes
     *    When a note is first created, set the `createdAt` and `updatedAt`
     *    properties to `Date.now()`. Whenever a note is modified, set the
     *    `updatedAt` property to `Date.now()`.
     * 
     * 2. Create a new `sortedNotes` array (doesn't need to be saved 
     *    in state) that orders the items in the array from 
     *    most-recently-updated to least-recently-updated.
     *    This may require a quick Google search.
     */

    // const sortedNotes = []

    console.log(notes.sort(notes.createdAt))

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
                            notes={notes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        {
           
                            <Editor
                                currentNote={currentNote}
                                updateNote={updateNote}
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
