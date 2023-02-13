import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, } from 'aws-amplify';
import {
  Button,
  Flex,
  Heading,
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

  async function fetchNotes() {
    let user = await Auth.currentAuthenticatedUser()
    let filter = {
      user: {
        eq: user.username
      }
    }
    const apiData = await API.graphql({ query: listNotes, variables: {filter: filter} });
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }

  function getdate() {
    let currentDate = new Date().toLocaleDateString();
    return currentDate
  };

  async function createNote(event) {
    event.preventDefault();
    let user = await Auth.currentAuthenticatedUser()
    const form = new FormData(event.target);
    const data = {
      lp: form.get("leadership principles"),
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
            <option value="Customer Obsession">Customer Obsession</option>
            <option value="Ownership">Ownership</option>
            <option value="Invent and simplify">Invent and simplify</option>
            <option value="Are right a lot">Are right a lot</option>
            <option value="Learn and be curious">Learn and be curious</option>
            <option value="Hire and Develop the best">Hire and develop the best</option>
            <option value="Insist on the highest standards">Insist on the highest standards</option>
            <option value="Earn trust">Earn trust</option>
            <option value="Bias for action">Bias for action</option>
            <option value="Dive deep">Dive deep</option>
            <option value="Have backbone; Disagree and commit">Have backbone; Disagree and commit</option>
            <option value="Deliver results">Deliver results</option>
            <option value="Strive to be Earth's best employer">Strive to be Earth's best employer</option>
            <option value="Success and scale bring broad responsibility">Success and scale bring broad responsibility</option>
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
        {notes.map((note) => (
          <div margin="5">
          <Flex
            key={note.id || note.lp}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="span" margin="1rem">
              {note.date}
            </Text>
            <Text as="strong" fontWeight={700}>
              {note.lp}
            </Text>
            <Text as="paragraph" width="50%">{note.description}</Text>
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete
            </Button>
          </Flex>
          </div>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);