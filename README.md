# WhatsApp Automation Panel (Node.js)

**What this is**
- A simple demo panel (frontend + backend) that reads a file of messages and repeatedly sends them
  to a target **number** or **group id** at a configurable interval in seconds.
- Designed for **educational / permission-based** usage only. Do not use for unsolicited messages.

**Features**
- Send to normal numbers (e.g. 919812345678)
- Send to groups using group IDs (e.g. 123456789@g.us)
- Upload a `.txt` file containing one message per line; messages will be sent in order and repeated.
- Configure interval in seconds between sends.
- Start / Stop from the panel.
- Simple logs on the panel (keeps last 200 entries in memory).

**Setup**
1. Copy `.env.example` to `.env` and fill:
   ```
   ACCESS_TOKEN=EAA...your_token_here...
   PHONE_NUMBER_ID=123456789012345
   PORT=3000
   ```
   - `ACCESS_TOKEN` must be a valid WhatsApp Cloud API token.
   - `PHONE_NUMBER_ID` is your WhatsApp Cloud phone number id (used for single-number sends).
   - For **group** sending you will supply a group id in the target field (format `...@g.us`).

2. Install dependencies:
   ```
   npm install
   ```

3. Run:
   ```
   npm start
   ```

4. Open panel at `http://localhost:3000`

**How to use**
- Choose Target Type: "Number" or "Group".
- Enter target (e.g. `919812345678` or `123456789@g.us`).
- Upload a `.txt` file that contains messages, one per line.
- Enter an interval in seconds (minimum recommended: 5s).
- Click Start. The server will cycle through messages and send them repeatedly until you click Stop.

**Important warnings**
- Sending bulk or automated messages to people who haven't opted in may violate WhatsApp terms and local laws.
- Use only with consent and for legitimate business flows.
- This code is provided as-is for educational purposes. You are responsible for how you deploy and use it.

