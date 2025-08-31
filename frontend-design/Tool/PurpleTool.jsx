import ToolLayout from "./Layout";
export default function PurpleTool() {
    const toolList = [// Non-Tech
        {
            name: "Cyber Fraud Identifier",
            image: "/cyber-fraud-identifier.png",
            description: "Flags potential online fraud by previous records",
            slug: "cyber-fraud-identifier",
            buttonLabel: "Identify Fraudster",
            type: "forensic"
        },
    ]
    return (<ToolLayout team="purple" toolList={toolList}></ToolLayout>)
}