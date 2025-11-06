
// Main script for L'Oréal Smart Routine & Product Advisor
// Prevent form refresh and handle chat input
document.addEventListener('DOMContentLoaded', function() {
	const form = document.getElementById('inputForm');
	const promptInput = document.getElementById('prompt');
	const chatEl = document.getElementById('chat');

	// System prompt for L'Oréal chatbot
		const systemPrompt = `You are an expert advisor representing L'Oréal. Respond with the authority, expertise, and professionalism of a senior L'Oréal beauty consultant. You ONLY answer questions about L'Oréal products and routines. If a user asks about anything unrelated to L'Oréal products and routines, politely refuse and say: 'Sorry, I can only answer questions about L'Oréal products and routines.'\n\nYour answers should:\n- Reference L'Oréal's scientific research, innovation, and commitment to beauty.\n- Provide detailed, brand-aligned product recommendations and routine guidance.\n- Explain the benefits and proper application of products, referencing ingredients and results when relevant.\n- Use a confident, knowledgeable, and warm tone, as a true L'Oréal expert would.\n- Make responses friendly, engaging, and interesting to read, as if chatting with a beauty-loving friend.\n- Use emojis to enhance warmth and clarity, but keep them tasteful and professional.`;

	// Message history for context
	const messages = [
		{ role: 'system', content: systemPrompt }
	];

	// Cloudflare Worker endpoint
	const workerUrl = 'https://broad-mode-315e.carlosm4.workers.dev/';

	// Append message to chat
		function appendMessage(text, cls = 'assistant') {
			if (!chatEl) return;
			const div = document.createElement('div');
			div.className = `message ${cls}`;
			div.textContent = text;
			chatEl.appendChild(div);
			chatEl.scrollTop = chatEl.scrollHeight;
			return div;
		}

	// Set loading state
	function setLoading(loading) {
		if (!promptInput || !form) return;
		promptInput.disabled = loading;
		form.querySelector('button').disabled = loading;
	}

	// Send messages to OpenAI via Cloudflare Worker
	async function queryWorker(messages) {
		const res = await fetch(workerUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages })
		});
		const data = await res.json();
		// OpenAI API returns choices[0].message.content
		return data.choices?.[0]?.message?.content || 'No response.';
	}

		if (form && promptInput && chatEl) {
			let lastUserDiv = null;
				form.addEventListener('submit', async function(e) {
					e.preventDefault();
					const text = promptInput.value.trim();
					if (!text) return;
					// Remove previous user question if present
					if (lastUserDiv && lastUserDiv.parentNode) {
						lastUserDiv.parentNode.removeChild(lastUserDiv);
						lastUserDiv = null;
					}
					// Show user question above AI response
					lastUserDiv = document.createElement('div');
					lastUserDiv.className = 'message user';
					lastUserDiv.textContent = 'You: ' + text;
					chatEl.appendChild(lastUserDiv);
					chatEl.scrollTop = chatEl.scrollHeight;
					promptInput.value = '';
					messages.push({ role: 'user', content: text });
					setLoading(true);
					// Show loading bubble instantly
					const loadingDiv = appendMessage('...', 'assistant');
					try {
						const reply = await queryWorker(messages);
						// Replace loading bubble with actual reply
						if (loadingDiv && loadingDiv.parentNode) {
							loadingDiv.textContent = reply;
							loadingDiv.className = 'message assistant';
						} else {
							appendMessage(reply, 'assistant');
						}
						messages.push({ role: 'assistant', content: reply });
					} catch (err) {
						if (loadingDiv && loadingDiv.parentNode) {
							loadingDiv.textContent = 'Sorry, something went wrong. Please try again.';
						} else {
							appendMessage('Sorry, something went wrong. Please try again.', 'assistant');
						}
						console.error(err);
					} finally {
						setLoading(false);
					}
				});
		}
});
