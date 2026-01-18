import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ListRenderItem,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList, Task } from '../types';

const TASKS_STORAGE_KEY = 'tasks';

type TaskListScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'TaskList'
>;
type TaskListScreenRouteProp = RouteProp<RootStackParamList, 'TaskList'>;

type Props = {
    navigation: TaskListScreenNavigationProp;
    route: TaskListScreenRouteProp;
};

const TaskListScreen = ({ navigation }: Props) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editedTask, setEditedTask] = useState<Task | null>(null);

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        saveTasks();
        navigation.setOptions({
            title: `To-do `,
        });
    }, [navigation, tasks]);

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
            if (storedTasks !== null) {
                const parsedTasks = JSON.parse(storedTasks) as Task[];
                setTasks(parsedTasks);
            }
        } catch (error) {
            console.error('Error loading tasks from AsyncStorage:', error);
        }
    };

    const saveTasks = async () => {
        try {
            await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks to AsyncStorage:', error);
        }
    };

    const handleDeleteTask = (taskId: string) => {
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);
    };

    const handleEditTask = (taskId: string) => {
        setEditingTask(taskId);
        const taskToEdit = tasks.find((task) => task.id === taskId);
        if (!taskToEdit) {
            return;
        }
        setEditedTask({ ...taskToEdit });
    };

    const handleSaveTask = () => {
        if (!editedTask || !editedTask.name) {
            Alert.alert('Validation Error', 'Task name is required.');
            return;
        }

        if (!editingTask) {
            return;
        }

        const updatedTasks = tasks.map((task) =>
            task.id === editingTask ? { ...editedTask } : task
        );
        setTasks(updatedTasks);
        setEditingTask(null);
        setEditedTask(null);
        saveTasks();
    };

    const renderItem: ListRenderItem<Task> = ({ item }) => (
        <View style={styles.taskItem}>
            <View style={styles.taskInfo}>
                <Text style={styles.taskName}>
                    <Text style={styles.boldText}></Text> {item.name}
                </Text>
                <Text style={styles.taskDescription}>
                    <Text style={styles.boldText}></Text> {item.description}
                </Text>
                <Text style={styles.taskCategory}>
                    <Text style={[styles.italicText, styles.boldText]}></Text> {item.category}
                </Text>
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
                    <View style={styles.deleteButton}>
                        <Ionicons name="trash" size={24} color="white" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleEditTask(item.id)}>
                    <View style={styles.editButton}>
                        <Ionicons name="create" size={24} color="white" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={styles.flatList}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddTask', { tasks, setTasks })}
            >
                <Ionicons name="add" size={36} color="white" />
            </TouchableOpacity>
            <Modal
                visible={editingTask !== null}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setEditingTask(null);
                    setEditedTask(null);
                }}
            >
                <TouchableOpacity
                    style={styles.editTaskModal}
                    activeOpacity={1} // Disables the default opacity effect
                    onPress={() => {
                        setEditingTask(null);
                        setEditedTask(null);
                    }}
                >
                    <View style={styles.editTaskContainer}>
                        <Text style={styles.editTaskTitle}>Edit Task</Text>
                        <TextInput
                            style={styles.editTaskInput}
                            placeholder="Task Name *"
                            value={editedTask?.name ?? ''}
                            onChangeText={(text) =>
                                setEditedTask((prevTask) =>
                                    prevTask ? { ...prevTask, name: text } : prevTask
                                )
                            }
                        />
                        <TextInput
                            style={styles.editTaskInput}
                            placeholder="Task Description"
                            value={editedTask?.description ?? ''}
                            onChangeText={(text) =>
                                setEditedTask((prevTask) =>
                                    prevTask ? { ...prevTask, description: text } : prevTask
                                )
                            }
                        />
                        <TextInput
                            style={styles.editTaskInput}
                            placeholder="Task Category"
                            value={editedTask?.category ?? ''}
                            onChangeText={(text) =>
                                setEditedTask((prevTask) =>
                                    prevTask ? { ...prevTask, category: text } : prevTask
                                )
                            }
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
                            <Ionicons name="checkmark-circle" size={36} color="blue" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#add8e6', // Light blue background
    },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#b0c4de', // Lighter blue border color
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        backgroundColor: 'white', // White background
    },
    taskInfo: {
        flex: 1,
    },
    taskName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333', // Dark text color
    },
    taskCategory: {
        color: '#3498db', // Blue text color
        fontStyle: 'italic', // Italic style for category
    },
    boldText: {
        fontWeight: 'bold',
    },
    italicText: {
        fontStyle: 'italic',
    },
    deleteButton: {
        backgroundColor: '#1e90ff', // Dodger blue background
        borderRadius: 10,
        padding: 5,
        marginRight: 8,
    },
    editButton: {
        backgroundColor: '#1e90ff', // Dodger blue background
        borderRadius: 10,
        padding: 5,
    },
    addButton: {
        backgroundColor: '#1e90ff', // Dodger blue background
        borderRadius: 50,
        width: 50,
        height: 50,
        position: 'absolute',
        bottom: 16,
        right: '40%',
        transform: [{ translateX: -25 }],
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatList: {
        flex: 1,
    },
    buttonsContainer: {
        flexDirection: 'row',
    },
    editTaskModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    },
    editTaskContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        width: '80%',
    },
    editTaskTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    editTaskInput: {
        height: 40,
        borderColor: '#b0c4de', // Lighter blue border color
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    saveButton: {
        // backgroundColor: '#1e90ff', // Dodger blue background
        borderRadius: 50,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 16,
    },
});

export default TaskListScreen; //export task list screen
