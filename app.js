const { port } = require("./config");
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("client/build"));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

app.get("/api/data", (req, res) => {
  try {
    let rawdata = fs.readFileSync("data.json");
    let data = JSON.parse(rawdata);
    res.status(200).send(data);
  } catch (err) {
    console.log(err.stack);
    res.status(500).send("Getting data failed - internal server error");
  }
});

app.post("/addFeedback", async (req, res) => {
  let rawdata = fs.readFileSync("data.json");
  let data = JSON.parse(rawdata);
  data.productRequests.push(req.body);

  let newData = JSON.stringify(data);
  fs.writeFile("data.json", newData, (err) => {
    if (err) throw err;
    console.log("New data added");
  });

  res.status(200).send({ msg: "Feedback has been added" });
});

app.delete("/deleteFeedback/:feedbackId", async (req, res) => {
  try {
    let rawdata = fs.readFileSync("data.json");
    let data = JSON.parse(rawdata);
    let theId = req.params.feedbackId;

    const indexToRemove = data.productRequests.findIndex(
      (fb) => fb.id === theId
    );
    data.productRequests.splice(indexToRemove, 1);
    let newData = JSON.stringify(data);

    fs.writeFile("data.json", newData, (err) => {
      if (err) throw err;
      console.log("Data deleted");
    });
    res.status(200).send({ msg: "Feedback was deleted" });
  } catch (err) {
    console.log(err.stack);
    res.status(500).send("Delete feedback failed - internal server error");
  }
});

app.put("/editFeedback/:feedbackId", async (req, res) => {
  try {
    let rawdata = fs.readFileSync("data.json");
    let data = JSON.parse(rawdata);
    let theId = req.params.feedbackId;

    const indexToEdit = data.productRequests.findIndex((fb) => fb.id == theId);

    data.productRequests[indexToEdit] = req.body;
    console.log(data.productRequests[indexToEdit]);

    let newData = JSON.stringify(data);
    fs.writeFile("data.json", newData, (err) => {
      if (err) throw err;
      console.log("Data edited");
    });

    res.status(200).send({ msg: "Feedback was edited" });
  } catch (err) {
    console.log(err.stack);
    res.status(500).send("Edit feedback failed - internal server error");
  }
});

app.put("/editUpvote/:feedbackId", async (req, res) => {
  try {
    let rawdata = fs.readFileSync("data.json");
    let data = JSON.parse(rawdata);
    let theId = req.params.feedbackId;

    const indexToEdit = data.productRequests.findIndex((fb) => fb.id == theId);

    data.productRequests[indexToEdit].upvotes++;

    let newData = JSON.stringify(data);
    fs.writeFile("data.json", newData, (err) => {
      if (err) throw err;
      console.log("Upvote edited");
    });
    res.status(200).send({ msg: "Upvote was edited" });
  } catch (err) {
    console.log(err.stack);
    res.status(500).send("Edit upvote failed - internal server error");
  }
});

app.put("/postComment/:feedbackId", async (req, res) => {
  try {
    let rawdata = fs.readFileSync("data.json");
    let data = JSON.parse(rawdata);
    let theId = req.params.feedbackId;

    const indexToEdit = data.productRequests.findIndex((fb) => fb.id == theId);

    data.productRequests[indexToEdit].comments.push(req.body);
    console.log(data.productRequests[indexToEdit].comments);
    let newData = JSON.stringify(data);
    fs.writeFile("data.json", newData, (err) => {
      if (err) throw err;
      console.log("Comment added");
    });
    res.status(200).send({ msg: "Comment was added" });
  } catch (err) {
    console.log(err.stack);
    res.status(500).send("Add comment failed - internal server error");
  }
});

app.put("/postReply/:feedbackId/:commentId", async (req, res) => {
  try {
    let rawdata = fs.readFileSync("data.json");
    let data = JSON.parse(rawdata);
    let feedbackId = req.params.feedbackId;
    let commentId = req.params.commentId;

    const indexToFeedback = data.productRequests.findIndex(
      (fb) => fb.id == feedbackId
    );

    const indexToComment = data.productRequests[
      indexToFeedback
    ].comments.findIndex((cm) => cm.id == commentId);

    const replies =
      data.productRequests[indexToFeedback].comments[indexToComment];

    if (
      data.productRequests[indexToFeedback].comments[indexToComment].replies ===
      undefined
    ) {
      data.productRequests[indexToFeedback].comments[indexToComment].replies =
        [];
    }
    data.productRequests[indexToFeedback].comments[indexToComment].replies.push(
      req.body
    );

    let newData = JSON.stringify(data);
    fs.writeFile("data.json", newData, (err) => {
      if (err) throw err;
      console.log("Reply added");
    });
    res.status(200).send({ msg: "Reply was added" });
  } catch (err) {
    console.log(err.stack);
    res.status(500).send("Add reply failed - internal server error");
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
