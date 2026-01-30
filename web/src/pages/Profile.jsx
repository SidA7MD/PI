import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api'; // Assuming you have an api service
import '../styles/Profile.css';
import { FaCamera, FaUser, FaPhone, FaEnvelope, FaLock, FaSave } from 'react-icons/fa';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        username: user?.username || '',
        phone: user?.phone || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('/auth/me', {
                username: formData.username,
                phone: formData.phone,
                email: formData.email
            });

            setUser(prev => ({ ...prev, ...response.data.user }));
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à jour' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors du changement de mot de passe' });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setLoading(true);
        try {
            const response = await api.post('/auth/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
            setMessage({ type: 'success', text: 'Avatar mis à jour' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors du téléchargement de l\'avatar' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <h2 className="page-title">Mon Profil</h2>
            
            {message.text && (
                <div className={`message-alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-content">
                <div className="profile-card avatar-section">
                    <div className="avatar-wrapper" onClick={handleAvatarClick}>
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="profile-avatar" />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="avatar-overlay">
                            <FaCamera />
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                    />
                    <h3>{user?.username}</h3>
                    <p className="role-badge">{user?.role}</p>
                </div>

                <div className="profile-forms">
                    <form onSubmit={handleUpdateProfile} className="profile-card">
                        <h3>Informations Personnelles</h3>
                        <div className="form-group">
                            <label><FaUser /> Nom d'utilisateur</label>
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaPhone /> Téléphone</label>
                            <input 
                                type="text" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaEnvelope /> Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                            />
                        </div>
                        <button type="submit" className="save-btn" disabled={loading}>
                            <FaSave /> Enregistrer
                        </button>
                    </form>

                    <form onSubmit={handleChangePassword} className="profile-card">
                        <h3>Changer le mot de passe</h3>
                        <div className="form-group">
                            <label><FaLock /> Mot de passe actuel</label>
                            <input 
                                type="password" 
                                name="currentPassword" 
                                value={formData.currentPassword} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaLock /> Nouveau mot de passe</label>
                            <input 
                                type="password" 
                                name="newPassword" 
                                value={formData.newPassword} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaLock /> Confirmer le mot de passe</label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                            />
                        </div>
                        <button type="submit" className="save-btn" disabled={loading}>
                            <FaSave /> Modifier
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
