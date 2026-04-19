import { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, User, X, ExternalLink } from 'lucide-react';
import { SiGithub, SiX } from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa';
import { toast } from 'sonner';
import type { Profile } from '@/types/models';
import FormField from '@/components/admin/FormField';
import ThemedInput from '@/components/admin/ThemedInput';
import ThemedTextarea from '@/components/admin/ThemedTextarea';
import ThemedButton from '@/components/admin/ThemedButton';

interface FormState {
    name: string;
    role: string;
    bio: string;
    githubUrl: string;
    linkedinUrl: string;
    twitterUrl: string;
}

const empty: FormState = { name: '', role: '', bio: '', githubUrl: '', linkedinUrl: '', twitterUrl: '' };
const BIO_MAX = 1000;

export default function ProfileTab() {
    const [form, setForm] = useState<FormState>(empty);
    const [savedForm, setSavedForm] = useState<FormState>(empty);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [avatarHovered, setAvatarHovered] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const resumeInputRef = useRef<HTMLInputElement>(null);

    const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

    useEffect(() => {
        fetch('/api/profile')
            .then(r => r.json())
            .then((p: Profile) => {
                const loaded: FormState = {
                    name: p.name,
                    role: p.role,
                    bio: p.bio,
                    githubUrl: p.githubUrl ?? '',
                    linkedinUrl: p.linkedinUrl ?? '',
                    twitterUrl: p.twitterUrl ?? '',
                };
                setForm(loaded);
                setSavedForm(loaded);
                setAvatarUrl(p.avatarUrl);
                setResumeUrl(p.resumeUrl);
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);

    function set(key: keyof FormState, value: string) {
        setForm(f => ({ ...f, [key]: value }));
    }

    async function uploadFile(file: File, fieldName: 'avatar' | 'resume'): Promise<string> {
        const folder = fieldName === 'resume' ? 'resumes' : 'avatars';
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', folder);
        fd.append('name', 'profile');
        const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const { url } = await res.json();
        return url;
    }

    async function removeResume() {
        try {
            const res = await fetch('/api/profile/resume', { method: 'DELETE', credentials: 'include' });
            if (!res.ok) throw new Error();
            setResumeUrl(null);
            toast.success('Resume removed');
        } catch {
            toast.error('Failed to remove resume');
        }
    }

    async function removeAvatar() {
        try {
            const res = await fetch('/api/profile/avatar', { method: 'DELETE', credentials: 'include' });
            if (!res.ok) throw new Error();
            setAvatarUrl(null);
            toast.success('Photo removed');
        } catch {
            toast.error('Failed to remove photo');
        }
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const url = await uploadFile(file, 'avatar');
            setAvatarUrl(url);
        } catch {
            toast.error('Avatar upload failed');
        } finally {
            setUploadingAvatar(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    }

    async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingResume(true);
        try {
            const url = await uploadFile(file, 'resume');
            setResumeUrl(url);
        } catch {
            toast.error('Resume upload failed');
        } finally {
            setUploadingResume(false);
            if (resumeInputRef.current) resumeInputRef.current.value = '';
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    role: form.role,
                    bio: form.bio,
                    githubUrl: form.githubUrl,
                    linkedinUrl: form.linkedinUrl,
                    twitterUrl: form.twitterUrl,
                    avatarUrl,
                    resumeUrl,
                }),
            });
            if (!res.ok) throw new Error();
            setSavedForm(form);
            toast.success('Profile updated');
        } catch {
            toast.error('Failed to save profile');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-cyan-accent" size={24} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Profile</h1>

            {/* Unsaved changes banner */}
            {isDirty && (
                <div
                    data-testid="unsaved-banner"
                    className="sticky top-14 z-30 -mx-6 px-6 py-2.5 mb-6 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between"
                >
                    <span className="text-xs text-amber-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                        Unsaved changes
                    </span>
                    <button
                        type="submit"
                        form="profile-form"
                        disabled={saving}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                    >
                        Save now →
                    </button>
                </div>
            )}

            <form id="profile-form" onSubmit={handleSave}>
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left sidebar — avatar, resume, social */}
                    <div className="lg:w-72 shrink-0 space-y-6">
                        {/* Avatar */}
                        <div className="bg-oxford-blue border border-yinmn-blue/30 rounded-2xl p-6 flex flex-col items-center gap-4">
                            <div
                                className="relative w-32 h-32 rounded-2xl bg-space-cadet border border-yinmn-blue/30 overflow-hidden flex items-center justify-center cursor-pointer"
                                onMouseEnter={() => setAvatarHovered(true)}
                                onMouseLeave={() => setAvatarHovered(false)}
                                onClick={() => avatarInputRef.current?.click()}
                                role="button"
                                aria-label={avatarUrl ? 'Replace photo' : 'Upload photo'}
                            >
                                {avatarUrl
                                    ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    : <User size={40} className="text-slate-500" />
                                }
                                <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 transition-opacity duration-150 ${avatarHovered ? 'opacity-100' : 'opacity-0'}`}>
                                    {uploadingAvatar
                                        ? <Loader2 size={18} className="animate-spin text-white" />
                                        : <Upload size={18} className="text-white" />
                                    }
                                    <span className="text-white text-[10px] font-medium">
                                        {uploadingAvatar ? 'Uploading…' : avatarUrl ? 'Replace' : 'Upload'}
                                    </span>
                                </div>
                                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm text-slate-400">Profile photo</p>
                                <p className="text-xs text-slate-600">JPEG, PNG, WebP — max 5MB</p>
                            </div>
                            {avatarUrl && (
                                <button
                                    type="button"
                                    onClick={removeAvatar}
                                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <X size={12} /> Remove photo
                                </button>
                            )}
                        </div>

                        {/* Resume */}
                        <div className="bg-oxford-blue border border-yinmn-blue/30 rounded-2xl p-6 space-y-3">
                            <p className="text-sm font-medium text-slate-300">Resume / CV</p>
                            <input ref={resumeInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeChange} />
                            <div className="flex flex-col gap-2">
                                {resumeUrl && (
                                    <a
                                        href={resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm border border-yinmn-blue/40 rounded-lg text-cyan-accent hover:border-cyan-accent/40 transition-colors"
                                    >
                                        <ExternalLink size={14} /> View resume
                                    </a>
                                )}
                                <button
                                    type="button"
                                    disabled={uploadingResume}
                                    onClick={() => resumeInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 text-sm border border-yinmn-blue/40 rounded-lg text-slate-400 hover:text-slate-200 hover:border-cyan-accent/40 transition-colors disabled:opacity-50"
                                >
                                    {uploadingResume ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    {uploadingResume ? 'Uploading…' : resumeUrl ? 'Replace' : 'Upload resume'}
                                </button>
                                {resumeUrl && (
                                    <button
                                        type="button"
                                        onClick={removeResume}
                                        className="flex items-center gap-2 px-4 py-2 text-sm border border-yinmn-blue/40 rounded-lg text-slate-400 hover:text-red-400 hover:border-red-400/40 transition-colors"
                                    >
                                        <X size={14} /> Remove
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-slate-600">PDF only — max 5MB</p>
                        </div>

                        {/* Social Links */}
                        <div className="bg-oxford-blue border border-yinmn-blue/30 rounded-2xl p-6 space-y-4">
                            <p className="text-sm font-medium text-slate-300">Social Links</p>
                            <FormField label={<span className="flex items-center gap-2"><SiGithub size={14} className="text-slate-400" /> GitHub URL</span>}>
                                <ThemedInput type="url" value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)} placeholder="https://github.com/…" />
                            </FormField>
                            <hr className="border-yinmn-blue/20" />
                            <FormField label={<span className="flex items-center gap-2"><FaLinkedinIn size={14} className="text-slate-400" /> LinkedIn URL</span>}>
                                <ThemedInput type="url" value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/…" />
                            </FormField>
                            <hr className="border-yinmn-blue/20" />
                            <FormField label={<span className="flex items-center gap-2"><SiX size={14} className="text-slate-400" /> X (Twitter) URL</span>}>
                                <ThemedInput type="url" value={form.twitterUrl} onChange={e => set('twitterUrl', e.target.value)} placeholder="https://x.com/…" />
                            </FormField>
                        </div>
                    </div>

                    {/* Right main — identity + bio + save */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-oxford-blue border border-yinmn-blue/30 rounded-2xl p-6 space-y-6">
                            <p className="text-sm font-medium text-slate-300">Identity</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Name" required>
                                    <ThemedInput value={form.name} onChange={e => set('name', e.target.value)} required />
                                </FormField>
                                <FormField label="Role / Title" required>
                                    <ThemedInput value={form.role} onChange={e => set('role', e.target.value)} placeholder="Software Engineer & Developer" required />
                                </FormField>
                            </div>

                            <hr className="border-yinmn-blue/20" />

                            <div className="space-y-1">
                                <FormField label="Bio">
                                    <ThemedTextarea
                                        value={form.bio}
                                        onChange={e => set('bio', e.target.value)}
                                        rows={8}
                                        placeholder="Tell visitors about yourself…"
                                        maxLength={BIO_MAX}
                                    />
                                </FormField>
                                <p
                                    data-testid="bio-char-count"
                                    className={`text-xs text-right ${form.bio.length >= BIO_MAX ? 'text-red-400' : 'text-slate-600'}`}
                                >
                                    {form.bio.length} / {BIO_MAX}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <ThemedButton type="submit" disabled={saving}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Profile'}
                            </ThemedButton>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}
