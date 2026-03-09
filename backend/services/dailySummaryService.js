const User = require('../models/User');
const Student = require('../models/Student');
const Absence = require('../models/Absence');
const Notification = require('../models/Notification');
const pushHandler = require('../utils/pushNotificationHandler');
const socketHandler = require('../utils/socketHandler');
const translationService = require('../services/translationService');

/**
 * Service to generate and send daily attendance summaries to parents
 */
exports.sendDailySummaries = async () => {
    console.log('📅 Starting daily summary notification service...');

    try {
        // 1. Get all parents who have at least one student linked and a push token
        const parents = await User.find({
            role: 'parent',
            students: { $exists: true, $not: { $size: 0 } }
        }).populate('students');

        console.log(`🔎 Found ${parents.length} parents to process`);

        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        let sentCount = 0;

        for (const parent of parents) {
            try {
                const lang = parent.language || 'fr';
                const studentIds = parent.students.map(s => s._id);

                // 2. Find all absences for these students in the last 24 hours
                const absences = await Absence.find({
                    student: { $in: studentIds },
                    date: { $gte: yesterday },
                    absenceType: { $in: ['absent', 'retard'] }
                }).populate('student', 'firstName lastName');

                if (absences.length === 0) continue;

                // 3. Group absences by student to create a friendly message
                const summaryByStudent = {};
                absences.forEach(abs => {
                    const name = `${abs.student.firstName} ${abs.student.lastName}`;
                    if (!summaryByStudent[name]) {
                        summaryByStudent[name] = { absent: 0, retard: 0 };
                    }
                    summaryByStudent[name][abs.absenceType]++;
                });

                // 4. Construct message
                let bodyParts = [];
                for (const [name, stats] of Object.entries(summaryByStudent)) {
                    let part = `${name} :`;
                    if (stats.absent > 0) part += ` ${stats.absent} ${lang === 'ar' ? 'غياب' : 'absence(s)'}`;
                    if (stats.retard > 0) part += ` ${stats.retard} ${lang === 'ar' ? 'تأخر' : 'retard(s)'}`;
                    bodyParts.push(part);
                }

                const title = translationService.t(lang, 'summary_title');
                const body = bodyParts.join('\n');

                // 5. Create notification in DB
                const notification = await Notification.create({
                    recipient: parent._id,
                    type: 'info',
                    title,
                    message: body,
                    data: {
                        isSummary: true,
                        absencesCount: absences.length,
                        timestamp: new Date()
                    }
                });

                // 6. Send via Socket.io
                socketHandler.emitAbsenceNotification(parent._id, notification);

                // 7. Send Push Notification
                if (parent.pushToken) {
                    await pushHandler.sendPushToUser(parent, title, body, {
                        type: 'summary',
                        notificationId: notification._id
                    });
                }

                sentCount++;
            } catch (err) {
                console.error(`❌ Error processing daily summary for parent ${parent._id}:`, err);
            }
        }

        console.log(`✅ Daily summary complete. Sent ${sentCount} notifications.`);
        return sentCount;
    } catch (error) {
        console.error('❌ Critical error in daily summary service:', error);
        throw error;
    }
};
