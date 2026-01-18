// AddTaskScreen.js
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';
import type { RootStackParamList, Task } from '../types';
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state',]);
type AddTaskScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddTask'>;
type AddTaskScreenRouteProp = RouteProp<RootStackParamList, 'AddTask'>;

type Props = {
    navigation: AddTaskScreenNavigationProp;
    route: AddTaskScreenRouteProp;
};

const AddTaskScreen = ({ navigation, route }: Props) => {
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskCategory, setTaskCategory] = useState('');

    const handleAddTask = () => {
        // Validation: Task name is necessary
        if (!taskName.trim()) {
            Alert.alert('Validation Error', 'Task name is required.');
            return;
        }

        const newTask: Task = {
            id: Math.random().toString(),
            name: taskName.trim(),
            description: taskDescription.trim(),
            category: taskCategory.trim(),
        };

        // Retrieve the existing tasks from AsyncStorage
        const existingTasks = route.params?.tasks ?? [];

        // Update the tasks with the new task
        const updatedTasks = [...existingTasks, newTask];

        // Save the updated tasks to AsyncStorage
        AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks))
            .then(() => {
                // Update the tasks state in TaskListScreen
                route.params.setTasks(updatedTasks);
            })
            .catch((error) => {
                console.error('Error saving tasks to AsyncStorage:', error);
                Alert.alert('Error', 'Failed to save the task. Please try again.');
            });

        navigation.goBack(); // Navigate back to TaskListScreen
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Task Screen</Text>

            <TextInput
                style={styles.input}
                placeholder="Task Name *"
                value={taskName}
                onChangeText={(text) => setTaskName(text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Task Description"
                value={taskDescription}
                onChangeText={(text) => setTaskDescription(text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Task Category"
                value={taskCategory}
                onChangeText={(text) => setTaskCategory(text)}
            />

            <Button title="Add Task" onPress={handleAddTask} />

            <Button
                title="Go Back"
                onPress={() => navigation.goBack()}
                color="#808080"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#add8e6', // Light blue background
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333', // Dark text color
    },
    input: {
        height: 40,
        borderColor: '#b0c4de', // Lighter blue border color
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        backgroundColor: 'white', // White background
    },
});

export default AddTaskScreen; //export add task screen
