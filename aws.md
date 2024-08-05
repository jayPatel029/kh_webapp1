**Reference for managing the services(all the commands and explanation):**
https://gist.github.com/maliarslan/a50c5f335a18ebb31068663cabec98af

**Deployment Steps for Updating Code from GitHub and Restarting Services**

**1. Log in to the EC2 Instance using Session Manager:**

**2. Switch to root user (if necessary):**

   - Switch to the root user for administrative privileges.
     ```
     sudo -i
     ```
     Enter your password if prompted.

**3. Navigate to the repository directory:**

   - Change to the directory where your repository is located.
     ```
     cd SPIT-Interns-Web-App or cd Kaustubh-Final-Repository
     ```
     Replace `SPIT-Interns-Web-App` with the actual path.

**4. Pull the latest changes from GitHub:**

   - Pull the latest code changes from your GitHub repository.
     ```
     git pull origin main
     ```
     Enter your GitHub personal access token when prompted.

**5. Install dependencies (if applicable):**

   - Navigate to the directories containing client and API code.
     ```
     cd client
     npm install
     cd ../api
     npm install
     ```
     Adjust paths and commands based on your project structure.

**6. Restart the systemd services:**

   - Assuming services are located in `/lib/systemd/system/`, restart them.
     ```
     systemctl restart appfrontend.service
     systemctl restart appbackend.service
     ```

---

**Explanation:**

- **Step 1**: Logging in via AWS Systems Manager ensures secure access to your EC2 instance without exposing SSH ports.
  
- **Step 2**: Switching to the root user (`sudo -i`) is required to perform administrative tasks such as restarting services.

- **Step 3**: Navigating to your repository directory (`cd /path/to/repository`) ensures you are in the correct location to pull the latest code.

- **Step 4**: Pulling the latest changes from GitHub (`git pull origin main`) updates your local repository with changes from the `main` branch of your GitHub repository.

- **Step 5**: Installing dependencies (`npm install`) ensures that any new dependencies required by the updated code are installed.

- **Step 6**: Restarting systemd services (`systemctl restart appfrontend.service` and `systemctl restart appbackend.service`) ensures that the updated code takes effect in your application.
