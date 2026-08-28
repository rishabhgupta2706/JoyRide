export const getOptimizedImageUrl = (url, width = 1200) => {
    if (!url) {
        return "";
    }

    if (!url.includes("res.cloudinary.com")) {
        return url;
    }

    return url.replace(
        "/upload/",
        `/upload/f_auto,q_auto,dpr_auto,w_${width}/`
    );
};