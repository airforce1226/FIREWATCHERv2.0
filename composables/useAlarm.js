import { ElMessage, ElNotification } from 'element-plus';

export const useAlarm = () => {
	const message = {
		success: msg =>
			ElMessage.success({ message: msg, duration: 2000, grouping: true }),
		error: msg =>
			ElMessage.error({ message: msg, duration: 2000, grouping: true }),
		warning: msg =>
			ElMessage.warning({ message: msg, duration: 2000, grouping: true }),
		info: msg =>
			ElMessage.info({ message: msg, duration: 2000, grouping: true }),
	};

	const notification = (title, message) => {
		ElNotification({
			title: title,
			message: message,
			offset: 100,
			zIndex: 2050,
		});
	};

	return { message, notification };
};

/* how to use
*
*
const { message } = useAlarm();
const showMessage = () => {
	message.success('Message', 'Duration', 'grouping(boolean)');
	message.error('Message', 'Duration', 'grouping(boolean)');
	message.warning('Message', 'Duration', 'grouping(boolean)');
	message.info('Message', 'Duration', 'grouping(boolean)');
}

const { notification } = useAlarm();
notification('제목', '내용');
*/
