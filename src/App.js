import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, Storage, } from 'aws-amplify';
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from '@aws-amplify/ui-react';
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import { Auth } from "aws-amplify";

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  // const user = Auth.currentAuthenticatedUser()

  useEffect(() => {
    fetchNotes();
  }, []);

  async function getUserInfo(){
    const user = await Auth.currentAuthenticatedUser()
    console.log(user.username);
    return user.username
  }

  const user = getUserInfo()

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }

  function getdate() {
    let currentDate = new Date().toLocaleDateString();
    return currentDate
  };

  async function createNote(event) {
    event.preventDefault();
    let user = await getUserInfo()
    const form = new FormData(event.target);
    const data = {
      name: form.get("leadership principles"),
      description: form.get("description"),
      date: getdate(),
      user: user.username
    };
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Heading level={1}>Learning log </Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <label for="leadership principles"></label>
          <select name="leadership principles" id="leadership principles">
            <option value="Think Big">Think Big</option>
            <option value="Frugality">Frugality</option>
          </select>
          <TextField
            name="description"
            placeholder="Despcribe what you learned"
            label="Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Save Learning
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Recent learning</Heading>
      <View margin="3rem 0">
        {notes.filter(function(notes){
          return notes.user === "blackfidelis"
        })
        .map((note) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="span" >
              {note.date}
            </Text>
            <Text as="span" >
              {note.user}
            </Text>
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);
