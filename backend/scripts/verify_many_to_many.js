const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const School = require('../models/School');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const run = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Get a School (or create mock context)
        const school = await School.findOne();
        if (!school) throw new Error('No school found');
        console.log('School found:', school.name);

        // 2. Create 2 Teachers
        const t1 = await User.create({
            username: 'TestTeacher1_' + Date.now(),
            email: 'tt1@test.com',
            password: 'password',
            role: 'teacher',
            school: school._id,
            phone: '11111111' + Math.floor(Math.random() * 1000)
        });
        const t2 = await User.create({
            username: 'TestTeacher2_' + Date.now(),
            email: 'tt2@test.com', // random email to avoid collision
            password: 'password',
            role: 'teacher',
            school: school._id,
            phone: '22222222' + Math.floor(Math.random() * 1000)
        });
        console.log('Teachers created:', t1._id, t2._id);

        // 3. Create a Class assigned to BOTH teachers (Simulation of createClass controller logic)
        const teacherIds = [t1._id, t2._id];

        const classObj = await Class.create({
            name: 'TestClassMultiTeacher',
            level: 'Test',
            schoolYear: '2025',
            school: school._id
        });
        
        // --- LOGIC FROM createClass ---
        classObj.teachers = teacherIds;
        await classObj.save();

        await User.updateMany(
            { 
              _id: { $in: teacherIds },
              school: school._id
            },
            { $addToSet: { classes: classObj._id } }
        );
        // ------------------------------

        console.log('Class created and teachers assigned.');

        // 4. Verify Class has teachers
        const verifiedClass = await Class.findById(classObj._id);
        console.log('Class teachers count:', verifiedClass.teachers.length);
        if (verifiedClass.teachers.length !== 2) console.error('FAIL: Class does not have 2 teachers');
        else console.log('PASS: Class has 2 teachers');

        // 5. Verify Teachers have Class
        const vt1 = await User.findById(t1._id);
        const vt2 = await User.findById(t2._id);
        console.log('Teacher 1 classes:', vt1.classes.length);
        console.log('Teacher 2 classes:', vt2.classes.length);

        if (vt1.classes.includes(classObj._id) && vt2.classes.includes(classObj._id)) {
            console.log('PASS: Both teachers have the class');
        } else {
            console.error('FAIL: Teacher missing class');
        }

        // 6. Test Update (remove teacher 2) - Simulation of updateClass Logic
        const newTeacherIds = [t1._id]; // Remove t2

        // --- LOGIC FROM updateClass ---
        await User.updateMany(
            { 
              classes: classObj._id, 
              _id: { $nin: newTeacherIds },
              school: school._id 
            }, 
            { $pull: { classes: classObj._id } }
        );

        await User.updateMany(
            { 
              _id: { $in: newTeacherIds },
              school: school._id
            }, 
            { $addToSet: { classes: classObj._id } }
        );

        verifiedClass.teachers = newTeacherIds;
        await verifiedClass.save();
        // ------------------------------

        console.log('Updated class to remove Teacher 2.');

        // 7. Verify Removal
        const vt2_after = await User.findById(t2._id);
        const vClass_after = await Class.findById(classObj._id);
        
        if (!vt2_after.classes.includes(classObj._id)) console.log('PASS: Teacher 2 removed from class (Teacher side)');
        else console.error('FAIL: Teacher 2 still has class');

        if (vClass_after.teachers.length === 1 && vClass_after.teachers[0].toString() === t1._id.toString()) console.log('PASS: Class has only Teacher 1');
        else console.error('FAIL: Class teacher list incorrect');

        // Cleanup
        await Class.deleteOne({ _id: classObj._id });
        await User.deleteOne({ _id: t1._id });
        await User.deleteOne({ _id: t2._id });
        console.log('Cleanup done.');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
