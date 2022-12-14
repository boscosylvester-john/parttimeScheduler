import type {NotificationObject, RequestForTakeUpObject, UserDetailsObject} from './interface';
import axios from 'axios';

export const getUser = async (userEmail: string, password: string): Promise<UserDetailsObject | boolean> => {
	// Const result = await axios({method: 'GET', url: 'http://localhost:3000/users', params: {userEmail}});
	try {
		const result = await axios({method: 'POST', url: 'http://localhost:8080/login', data: {email: userEmail, password}, responseType: 'json'});
		console.log(result);
		return result.data as UserDetailsObject;
	} catch (e: unknown) {
		console.log(e);
		return false;
	}
};

export const getNotifications = async (storeName: string): Promise<NotificationObject[]> => {
	try {
		// Const result = await axios({method: 'GET', url: 'http://localhost:3000/notifications', params: {userEmail}});
		const result = await axios({method: 'POST', url: 'http://localhost:8080/allNotifs', data: {storeName}, responseType: 'json'});
		console.log(result);
		const notifs = result.data as NotificationObject[];
		return notifs.slice(-15);
	} catch (e: unknown) {
		console.log('Error in getting notifications');
		return [];
	}
};

export const getRequestsForTakeUp = async (storeName: string): Promise<RequestForTakeUpObject[]> => {
	try {
		// Const result = await axios({method: 'GET', url: 'http://localhost:3000/notifications', params: {userEmail}});
		const result = await axios({method: 'POST', url: 'http://localhost:8080/allRequests', data: {storeName}, responseType: 'json'});
		return result.data as RequestForTakeUpObject[];
	} catch (e: unknown) {
		console.log('Error in getting notifications');
		return [];
	}
};

export const offerShiftApi = async (shiftId: string, weekNumber: number, offererEmail: string): Promise<void> => {
	try {
		const result = await axios({method: 'POST', url: 'http://localhost:8080/offerShift', data: {shiftId, weekNumber, email: offererEmail}});
	} catch (e: unknown) {
		console.log('Error thrown while offering the shift');
	}
};

export const bidForShiftApi = async (shiftId: string, weekNumber: number, takerEmail: string, offererEmail: string): Promise<void> => {
	try {
		const result = await axios({method: 'POST', url: 'http://localhost:8080/applyBid', data: {shiftId, weekNumber, takerEmail, giverEmail: offererEmail}});
	} catch (e: unknown) {
		console.log('Error thrown while offering the shift');
	}
};
