import { dummyadmin } from "../assets";


export default function getValidImageUrl(url) {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    const isValidUrl = urlRegex.test(url);
    const profilePhotoUrl = isValidUrl ? url : dummyadmin;
    return profilePhotoUrl;
}

export const formatDate = (dateString) => {
    // Assuming dateString is in "yyyy-mm-dd" format
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

// export function checkURl(url) {
//     const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
//     url = encodeURIComponent(url);
//     console.log(url);
//     const isValidUrl = urlRegex.test(url);
//     const res = isValidUrl ? true : false;
//     return res;
// }

export function checkURl(url) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    // Decode the URL
    const decodedUrl = decodeURIComponent(url);
    // Check if the URL is valid and ends with an image extension
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    const isValidUrl = urlRegex.test(decodedUrl);
    const extension = decodedUrl.split('.').pop().toLowerCase();
    const isImage = imageExtensions.includes(extension);
    return isValidUrl && isImage;
}

export function isValidHttpUrl(url) {
    return /^http/i.test(url);
}

export const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
};