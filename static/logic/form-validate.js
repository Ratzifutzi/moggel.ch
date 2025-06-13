ValuesBeforeFocus = {};

async function main() {
	// Get all form elements on the page
	const forms = document.querySelectorAll("form");

	// Filter out everything that doesnt have a pattern field
	const patternForms = Array.from(forms).filter(form => {
		return Array.from(form.elements).some(element => element.pattern);
	});

	// if the user tries to enter a value into the field that doesnt match the pattern, remove the wrong value
	patternForms.forEach(form => {
		form.addEventListener("focusin", function(event) {
			const target = event.target;
			if (target.pattern && target.value) {
				ValuesBeforeFocus[target.name] = target.value;
			}
		})

		form.addEventListener("focusout", function(event) {
			const target = event.target;
			if (target.pattern && target.value && !new RegExp(target.pattern).test(target.value)) {
				if (ValuesBeforeFocus[target.name]) {
					target.value = ValuesBeforeFocus[target.name];
				} else {
					target.value = "";
				}

				alert(`Invalid input for ${target.name}. ${target.dataset.humanPattern}`);
			}
		});
	});
}

document.addEventListener("DOMContentLoaded", main);