import React, { SetStateAction, useEffect, useState } from 'react';
import { Amplify, API, graphqlOperation } from 'aws-amplify';
import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import './App.css';
import awsExports from "./aws-exports";
import { ListTodosQuery } from './API';
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

function App() {
    const [formState, setFormState] = useState(initialState)
    const [todos, setTodos] = useState<any | null>([])

    useEffect(() => {
        fetchTodos()
    }, [])

    function setInput(key: string, value: string) {
        setFormState({ ...formState, [key]: value })
    }

    async function fetchTodos():Promise<any> {
        try {
            const todoData = (await API.graphql(graphqlOperation(listTodos))) as { data: ListTodosQuery; errors: any[] };
            const todos = todoData.data.listTodos?.items
            setTodos(todos)
        } catch (err) { console.log('error fetching todos') }
    }

    async function addTodo():Promise<any> {
        try {
            if (!formState.name || !formState.description) return
            const todo = { ...formState }
            setTodos([...todos, todo] as SetStateAction<never[]>)
            setFormState(initialState)
            await API.graphql(graphqlOperation(createTodo, { input: todo }))
        } catch (err) {
            console.log('error creating todo:', err)
        }
    }

    return (
        <div className="container">
            <h2>My Todos App</h2>
            <input
                onChange={event => setInput('name', event.target.value)}
                placeholder="Todo name"
                value={formState.name}
            />
            <input
                onChange={event => setInput('description', event.target.value)}
                placeholder="Todo description"
                value={formState.description}
            />
            <button onClick={addTodo}>Create Todo</button>
            {
                todos.map((todo: any, index: number) => (
                    <div key={todo.id ? todo.id : index} className="todo">
                        <p>{todo.name}</p>
                        <p>{todo.description}</p>
                    </div>
                ))
            }
        </div>
                
    );
}

export default App;
