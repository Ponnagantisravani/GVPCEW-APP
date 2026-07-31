from app import EnrollmentApp


if __name__ == "__main__":
    app = EnrollmentApp()
    app.protocol("WM_DELETE_WINDOW", app.on_close)
    app.mainloop()
