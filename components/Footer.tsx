"use client";

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            FileSharing
                        </h3>
                        <p className="text-sm text-muted-color">
                            A simple and secure way to share files anonymously.
                            All files are encrypted and automatically deleted.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <p className="text-sm text-muted-color">
                            Have questions or suggestions?
                            <br />
                            <a
                                href="mailto:me@ll-u.ru"
                                className="text-primary-color hover:underline"
                            >
                                me@ll-u.ru
                            </a>
                        </p>
                    </div>
                </div>

                <div className="pt-5 text-sm text-center text-muted-color">
                    <p>FileSharing &copy; {year}. All rights reserved.</p>
                    <p className="mt-2">
                        Created with <span className="text-red-500">❤</span> for
                        secure file sharing
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
